import type { PaymentPhase } from './types';
import type { Order, Payment } from '@checkout/contracts';
import { isPaid } from './form';

/** Выводит единое состояние интерфейса из заказа и относящегося к нему платежа. */
export function paymentPhase(
  order: Pick<Order, 'id' | 'status' | 'paymentStatus' | 'paymentMethod'> | null,
  payment: Pick<Payment, 'orderId' | 'status'> | null,
  loading = false,
): PaymentPhase {
  if (!order || loading) return 'loading';

  if (isPaid(order)) return 'paid';

  if (order.paymentMethod === 'cash_on_delivery' && order.status === 'confirmed')
    return 'cash_confirmed';

  if (!payment || payment.orderId !== order.id) return 'not_started';

  switch (payment.status) {
    case 'pending':
      return 'choosing_card';
    case 'processing':
      return 'processing';
    case 'succeeded':
      return 'verifying_order';
    case 'failed':
      return 'failed';
    case 'cancelled':
      return 'cancelled';
  }
}

/** Разрешает новую попытку оплаты только до старта, после отказа или отмены. */
export const canStartPayment = (phase: PaymentPhase) =>
  ['not_started', 'failed', 'cancelled'].includes(phase);

/** Определяет завершённое оформление для карты и наличных при получении. */
export const paymentComplete = (phase: PaymentPhase) =>
  phase === 'paid' || phase === 'cash_confirmed';

/** Определяет, ожидается ли обработка платежа или подтверждение заказа. */
export const paymentWaiting = (phase: PaymentPhase) =>
  phase === 'processing' || phase === 'verifying_order';
