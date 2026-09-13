// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildApp } from '../../api/dist/app.js';
import { CheckoutForm } from '../src/components/CheckoutForm';
import { checkout } from '../src/model/checkout';
import { initialDraft } from '../src/model/form';
import { injectAxios, storage } from './harness';

let app: Awaited<ReturnType<typeof buildApp>>;
let http: ReturnType<typeof injectAxios>;

beforeEach(async () => {
  storage();
  checkout.close();
  checkout.set({
    draft: structuredClone(initialDraft),
    fields: {},
    busy: false,
    orderUncertain: false,
  });
  app = await buildApp({ paymentDelayMs: 1200 });
  http = injectAxios(app);
  await checkout.boot();
  await checkout.updateItem('lamp-orbit', 1);
  checkout.navigate('checkout');
});

afterEach(async () => {
  cleanup();
  checkout.close();
  await app.close();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('validates before submission and focuses the first invalid contact', async () => {
  render(<CheckoutForm />);
  const submit = vi.spyOn(checkout, 'submit');

  fireEvent.submit(screen.getByRole('textbox', { name: 'Email' }).closest('form')!);
  await vi.waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Имя и фамилия' })),
  );
  expect(screen.getByRole('textbox', { name: 'Email' }).getAttribute('aria-invalid')).toBe('true');
  expect(submit).not.toHaveBeenCalled();
});

it('persists masked phone and restores form values after unmount', async () => {
  const user = userEvent.setup();
  const view = render(<CheckoutForm />);

  await user.type(screen.getByRole('textbox', { name: 'Имя и фамилия' }), 'Иван Петров');
  await user.type(screen.getByRole('textbox', { name: 'Телефон' }), '89991234567');
  expect(checkout.state.draft.customer.phone).toBe('+79991234567');
  expect(JSON.parse(localStorage.getItem('checkout.draft')!).customer.name).toBe('Иван Петров');
  view.unmount();
  render(<CheckoutForm />);
  expect((screen.getByRole('textbox', { name: 'Имя и фамилия' }) as HTMLInputElement).value).toBe(
    'Иван Петров',
  );
  expect((screen.getByRole('textbox', { name: 'Телефон' }) as HTMLInputElement).value).toContain(
    '999',
  );
});

it('recalculates after nested address edits and preserves the courier draft across delivery switches', async () => {
  const user = userEvent.setup();

  render(<CheckoutForm />);
  await user.click(screen.getByRole('radio', { name: /Курьер/ }));
  await user.type(screen.getByRole('textbox', { name: 'Город' }), 'Москва');
  await user.type(screen.getByRole('textbox', { name: 'Улица' }), 'Лесная');
  await user.type(screen.getByRole('textbox', { name: 'Дом' }), '12');
  await vi.waitFor(() => expect(checkout.state.quote).not.toBeNull());
  const previous = http.calls.filter((call) => call.path.endsWith('/quotes')).length;

  await user.type(screen.getByRole('textbox', { name: 'Дом' }), '3');
  await vi.waitFor(() =>
    expect(http.calls.filter((call) => call.path.endsWith('/quotes')).length).toBeGreaterThan(
      previous,
    ),
  );
  expect(checkout.state.draft.address.house).toBe('123');
  await user.click(screen.getByRole('radio', { name: /Самовывоз/ }));
  expect(screen.queryByRole('textbox', { name: 'Город' })).toBeNull();
  await user.click(screen.getByRole('radio', { name: /Курьер/ }));
  expect((screen.getByRole('textbox', { name: 'Дом' }) as HTMLInputElement).value).toBe('123');
});

it('shows server validation on the matching field', async () => {
  render(<CheckoutForm />);
  act(() => checkout.set({ fields: { email: 'Сервер отклонил email' } }));
  expect(await screen.findByText('Сервер отклонил email')).toBeDefined();
  expect(screen.getByRole('textbox', { name: 'Email' }).getAttribute('aria-invalid')).toBe('true');
});

it('retries an uncertain order even if the editable draft is invalid', async () => {
  checkout.set({ orderUncertain: true });
  const submit = vi.spyOn(checkout, 'submit').mockResolvedValue();

  render(<CheckoutForm />);
  await userEvent.setup().click(screen.getByRole('button', { name: /Проверить/ }));
  await vi.waitFor(() => expect(submit).toHaveBeenCalledOnce());
  expect(screen.getByRole('textbox', { name: 'Email' }).matches(':disabled')).toBe(true);
});
