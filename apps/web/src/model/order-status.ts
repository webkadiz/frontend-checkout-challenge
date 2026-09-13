import type { Order } from '@checkout/contracts';
import { ordersText } from '../constants/orders';
import { isPaid } from './form';

/** Подбирает подпись и визуальный вариант статуса заказа из серверных данных. */
export function orderStatus(order: Order) {
  if (isPaid(order)) return { label: ordersText.paid, tone: 'success' };

  if (order.paymentMethod === 'cash_on_delivery' && order.status === 'confirmed')
    return { label: ordersText.cash, tone: 'success' };

  if (order.paymentStatus === 'pending') return { label: ordersText.processing, tone: 'pending' };

  if (order.paymentStatus === 'failed') return { label: ordersText.failed, tone: 'warning' };

  if (order.paymentStatus === 'cancelled') return { label: ordersText.cancelled, tone: 'warning' };

  return { label: ordersText.unpaid, tone: 'pending' };
}
