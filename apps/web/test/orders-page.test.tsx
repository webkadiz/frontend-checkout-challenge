// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Order } from '@checkout/contracts';
import { OrdersPage } from '../src/components/OrdersPage';
import { orderStatus } from '../src/model/order-status';
import { checkout } from '../src/model/checkout';

const initial = checkout.state;

const order: Order = {
  id: 'first',
  number: 'DEMO-000001',
  status: 'awaiting_payment',
  paymentStatus: 'unpaid',
  paymentMethod: 'card',
  customer: { name: 'Тест', email: 'buyer@example.test', phone: '+79991234567' },
  items: [
    {
      productId: 'mug-line',
      title: 'Кружка «Линия»',
      quantity: 1,
      unitPrice: 89000,
      lineTotal: 89000,
    },
  ],
  delivery: { method: 'pickup', pickupPointId: 'point-center' },
  subtotal: 89000,
  shipping: 0,
  total: 89000,
  currency: 'RUB',
  createdAt: '2026-09-13T09:00:00Z',
};

beforeEach(() => {
  vi.spyOn(checkout, 'refreshOrders').mockResolvedValue();
  checkout.set({ ...initial, orders: [], busy: false });
});

afterEach(() => {
  cleanup();
  checkout.set(initial);
  vi.restoreAllMocks();
});

it('shows an empty state with a catalog action', async () => {
  const navigate = vi.spyOn(checkout, 'navigate').mockImplementation(() => {});

  render(<OrdersPage />);
  expect(screen.getByText('Заказов пока нет.')).toBeDefined();
  await userEvent.click(screen.getByRole('button', { name: 'К коллекции' }));
  expect(navigate).toHaveBeenCalledWith('catalog');
});

it('renders every order and opens the selected id', async () => {
  const open = vi.spyOn(checkout, 'openOrder').mockResolvedValue();

  checkout.set({
    orders: [
      order,
      { ...order, id: 'second', number: 'DEMO-000002', status: 'paid', paymentStatus: 'succeeded' },
    ],
  });
  render(<OrdersPage />);
  expect(screen.getAllByRole('article')).toHaveLength(2);
  expect(screen.getByText('Не оплачен')).toBeDefined();
  expect(screen.getByText('Оплачен')).toBeDefined();
  await userEvent.click(screen.getByRole('button', { name: 'Открыть заказ DEMO-000002' }));
  expect(open).toHaveBeenCalledWith('second');
  expect(checkout.refreshOrders).toHaveBeenCalledOnce();
});

it.each([
  ['pending', 'Ожидаем оплату'],
  ['failed', 'Оплата не прошла'],
  ['cancelled', 'Оплата отменена'],
] as const)('labels payment status %s without treating it as paid', (paymentStatus, label) => {
  expect(orderStatus({ ...order, paymentStatus }).label).toBe(label);
});

it('distinguishes cash on delivery from an unpaid card order', () => {
  expect(
    orderStatus({ ...order, paymentMethod: 'cash_on_delivery', status: 'confirmed' }).label,
  ).toBe('Оплата при получении');
});
