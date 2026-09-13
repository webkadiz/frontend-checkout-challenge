// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentPanel } from '../src/components/OrderPage/PaymentPanel';
import { OrderItemDetails } from '../src/components/OrderItemDetails';
import { orderText } from '../src/constants/order';
import { rub } from '../src/model/form';
import type { Sandbox } from '../src/types';

afterEach(cleanup);

const sandbox: Sandbox = {
  settlementDelayMs: 100,
  cards: [
    { id: 'success', title: 'Successful card', maskedNumber: '**** 4242', scenario: 'success' },
    { id: 'decline', title: 'Declined card', maskedNumber: '**** 0002', scenario: 'decline' },
  ],
};

const createProps = () => ({
  total: 125000,
  sandbox,
  card: 'success',
  busy: false,
  simulation: null,
  onCardChange: vi.fn(),
  onPay: vi.fn(),
  onCancel: vi.fn(),
});

it('delegates card selection and payment actions without adding form submissions', async () => {
  const props = createProps();
  const view = render(<PaymentPanel {...props} />);
  const user = userEvent.setup();

  await user.click(screen.getByRole('radio', { name: /Declined card/ }));
  expect(props.onCardChange).toHaveBeenCalledExactlyOnceWith('decline');
  view.rerender(<PaymentPanel {...props} card="decline" />);
  expect((screen.getByRole('radio', { name: /Declined card/ }) as HTMLInputElement).checked).toBe(
    true,
  );
  await user.click(screen.getByRole('button', { name: `${orderText.pay}${rub(props.total)}` }));
  await user.click(screen.getByRole('button', { name: orderText.cancelPayment }));
  expect(props.onPay).toHaveBeenCalledTimes(1);
  expect(props.onCancel).toHaveBeenCalledTimes(1);
  expect(
    screen.getAllByRole('button').every((button) => button.getAttribute('type') === 'button'),
  ).toBe(true);
});

it('blocks card changes, payment and cancellation while busy', async () => {
  const props = createProps();

  render(<PaymentPanel {...props} busy />);

  const user = userEvent.setup();

  await user.click(screen.getByRole('radio', { name: /Declined card/ }));
  for (const button of screen.getAllByRole('button')) await user.click(button);
  expect(props.onCardChange).not.toHaveBeenCalled();
  expect(props.onPay).not.toHaveBeenCalled();
  expect(props.onCancel).not.toHaveBeenCalled();
});

it('allows retrying an uncertain action without changing its selected scenario', async () => {
  const props = createProps();

  render(<PaymentPanel {...props} card="decline" simulation="decline" />);

  const user = userEvent.setup();

  await user.click(screen.getByRole('radio', { name: /Successful card/ }));
  await user.click(screen.getByRole('button', { name: orderText.cancelPayment }));
  await user.click(screen.getByRole('button', { name: orderText.retryAction }));
  expect(props.onCardChange).not.toHaveBeenCalled();
  expect(props.onCancel).not.toHaveBeenCalled();
  expect(props.onPay).toHaveBeenCalledTimes(1);
});

it('uses the same product description markup in order summaries and history', () => {
  const { container } = render(<OrderItemDetails title="Mug" quantity={3} />);

  expect(container.firstElementChild?.tagName).toBe('SPAN');
  expect(container.firstElementChild?.textContent).toBe(`Mug3${orderText.quantitySuffix}`);
  expect(container.querySelector('small')?.textContent).toBe(`3${orderText.quantitySuffix}`);
});
