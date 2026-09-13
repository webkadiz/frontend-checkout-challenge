// @vitest-environment jsdom
import type { Cart, Quote } from '@checkout/contracts';
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { CartSummary } from '../src/components/CartSummary';
import { rub } from '../src/model/form';

afterEach(cleanup);

const cart: Cart = {
  id: 'cart',
  version: 1,
  items: [],
  quantity: 1,
  subtotal: 249000,
  currency: 'RUB',
};

const quote: Quote = {
  id: 'quote',
  cartVersion: 1,
  items: [],
  subtotal: cart.subtotal,
  shipping: 35000,
  total: 284000,
  currency: 'RUB',
  delivery: { method: 'pickup', pickupPointId: 'point-center' },
  expiresAt: '2026-09-13T12:00:00Z',
};

const props = { cart, products: [], busy: false, quoting: false, pendingProductId: null };

function total() {
  return screen.getByText('Итого').nextElementSibling!;
}

it('shows the subtotal with a delivery disclaimer before the first calculation', () => {
  render(<CartSummary {...props} quote={null} />);
  expect(total().textContent).toBe(rub(cart.subtotal));
  expect(screen.getByRole('status').textContent).toBe('Пока без учёта доставки');
});

it('keeps the last total and shipping while recalculating, then replaces them', () => {
  const view = render(<CartSummary {...props} quote={quote} />);
  const amount = total().firstElementChild;

  view.rerender(<CartSummary {...props} quote={null} quoting />);
  expect(total().textContent).toBe(rub(quote.total));
  expect(total().firstElementChild).toBe(amount);
  expect(total().getAttribute('aria-busy')).toBe('true');
  expect(screen.getByText('Доставка').nextElementSibling?.textContent).toBe(rub(quote.shipping));
  expect(screen.getByRole('status').textContent).toContain('Обновляем стоимость');
  view.rerender(<CartSummary {...props} quote={{ ...quote, shipping: 0, total: cart.subtotal }} />);
  expect(total().textContent).toBe(rub(cart.subtotal));
  expect(total().getAttribute('aria-busy')).toBe('false');
  expect(screen.getByText('Бесплатно')).toBeDefined();
});

it('keeps the amount while a cart update is pending, including before the quote request', () => {
  const view = render(<CartSummary {...props} quote={quote} />);

  view.rerender(<CartSummary {...props} quote={null} busy pendingProductId="lamp-orbit" />);
  expect(total().textContent).toBe(rub(quote.total));
  expect(total().getAttribute('aria-busy')).toBe('true');
});

it('does not present a stale total as confirmed when calculation fails or address is incomplete', () => {
  const view = render(<CartSummary {...props} quote={quote} />);

  view.rerender(<CartSummary {...props} quote={null} quoting />);
  view.rerender(<CartSummary {...props} quote={null} />);
  expect(total().textContent).toBe(rub(cart.subtotal));
  expect(screen.getByRole('status').textContent).toBe('Пока без учёта доставки');
  expect(screen.getByText('После выбора адреса')).toBeDefined();
});
