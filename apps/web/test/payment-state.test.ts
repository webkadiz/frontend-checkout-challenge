import { expect, it } from 'vitest';
import {
  paymentPhase,
  paymentComplete,
  paymentWaiting,
  canStartPayment,
} from '../src/model/payment-state';

const order = {
  id: 'one',
  status: 'awaiting_payment',
  paymentStatus: 'unpaid',
  paymentMethod: 'card',
} as const;

it.each([
  ['pending', 'choosing_card'],
  ['processing', 'processing'],
  ['succeeded', 'verifying_order'],
  ['failed', 'failed'],
  ['cancelled', 'cancelled'],
] as const)('maps %s to %s', (status, phase) => {
  expect(paymentPhase(order, { orderId: 'one', status })).toBe(phase);
});

it('does not announce success from a payment alone or another order payment', () => {
  expect(paymentComplete(paymentPhase(order, { orderId: 'one', status: 'succeeded' }))).toBe(false);
  expect(paymentPhase(order, { orderId: 'another', status: 'succeeded' })).toBe('not_started');
  expect(paymentPhase({ ...order, status: 'paid', paymentStatus: 'succeeded' }, null)).toBe('paid');
});

it('distinguishes choosing a card from polling and guards legal start actions', () => {
  expect(paymentWaiting('choosing_card')).toBe(false);
  expect(paymentWaiting('processing')).toBe(true);
  expect(paymentWaiting('verifying_order')).toBe(true);
  expect(canStartPayment('choosing_card')).toBe(false);
  expect(canStartPayment('paid')).toBe(false);
  expect(canStartPayment('failed')).toBe(true);
  expect(canStartPayment('cancelled')).toBe(true);
});

it('handles loading and cash orders separately', () => {
  expect(paymentPhase(null, null)).toBe('loading');
  expect(paymentPhase(order, null, true)).toBe('loading');
  expect(
    paymentPhase({ ...order, paymentMethod: 'cash_on_delivery', status: 'confirmed' }, null),
  ).toBe('cash_confirmed');
});
