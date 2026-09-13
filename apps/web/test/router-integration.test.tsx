// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router/dom';
import { buildApp } from '../../api/dist/app.js';
import { createShopRouter } from '../src/router';
import { checkout } from '../src/model/checkout';
import { initialDraft } from '../src/model/form';
import { injectAxios, storage } from './harness';

let app: Awaited<ReturnType<typeof buildApp>>;
let router: ReturnType<typeof createShopRouter>;

beforeEach(async () => {
  storage();
  window.history.replaceState(null, '', '/');
  checkout.close();
  checkout.set({
    ready: false,
    busy: false,
    error: null,
    draft: structuredClone(initialDraft),
    orderUncertain: false,
  });
  app = await buildApp({ paymentDelayMs: 1200 });
  injectAxios(app);
  router = createShopRouter();
  render(<RouterProvider router={router} />);
  await vi.waitFor(() => expect(checkout.state.ready && !checkout.state.busy).toBe(true));
});

afterEach(async () => {
  cleanup();
  router.dispose();
  checkout.close();
  await app.close();
  vi.unstubAllGlobals();
});

it('renders real routes, preserves the draft and updates the catalog after going back', async () => {
  const user = userEvent.setup();

  await user.click(
    screen.getByRole('button', { name: 'Увеличить количество: Настольная лампа «Орбита»' }),
  );
  await vi.waitFor(() => expect(checkout.state.cart?.quantity).toBe(1));
  await user.click(screen.getByRole('button', { name: 'Корзина 1' }));
  const name = await screen.findByRole('textbox', { name: 'Имя и фамилия' });

  await user.type(name, 'Иван Петров');
  await user.type(
    screen.getByRole('textbox', { name: 'Email', exact: true }),
    'buyer@example.test',
  );
  await user.type(screen.getByRole('textbox', { name: 'Телефон', exact: true }), '9991234567');
  expect(window.location.hash).toBe('#/checkout');
  await act(async () => {
    await router.navigate(-1);
  });
  await vi.waitFor(() => expect(checkout.state.page).toBe('catalog'));
  expect(screen.queryByRole('textbox', { name: 'Имя и фамилия' })).toBeNull();
  await act(async () => {
    await router.navigate(1);
  });
  expect(
    ((await screen.findByRole('textbox', { name: 'Имя и фамилия' })) as HTMLInputElement).value,
  ).toBe('Иван Петров');
  expect(
    (screen.getByRole('textbox', { name: 'Email', exact: true }) as HTMLInputElement).value,
  ).toBe('buyer@example.test');
  expect(checkout.state.draft.customer.phone).toBe('+79991234567');
});

it('renders a specific order and keeps its data live after route changes', async () => {
  await act(async () => {
    await checkout.updateItem('lamp-orbit', 1);
    checkout.navigate('checkout');
    checkout.edit({
      ...initialDraft,
      customer: { name: 'Иван Петров', email: 'buyer@example.test', phone: '+79991234567' },
      paymentMethod: 'cash_on_delivery',
    });
    await checkout.submit();
  });
  expect(checkout.state.error).toBeNull();
  const order = checkout.state.order!;

  expect(window.location.hash).toBe(`#/orders/${order.id}`);
  expect(await screen.findByRole('heading', { name: order.number, exact: true })).toBeDefined();
  await userEvent
    .setup()
    .click(screen.getAllByRole('button', { name: 'Мои заказы', exact: true })[0]);
  expect(await screen.findByRole('heading', { name: 'Мои заказы.' })).toBeDefined();
  await act(async () => {
    await router.navigate(-1);
  });
  await vi.waitFor(() => expect(checkout.state.page).toBe('order'));
  expect(await screen.findByRole('heading', { name: order.number, exact: true })).toBeDefined();
});
