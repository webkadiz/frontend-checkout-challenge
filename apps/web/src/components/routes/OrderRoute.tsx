import { useSyncExternalStore } from 'react';
import { checkout } from '../../model/checkout';
import { OrderPage } from '../OrderPage';

/** Сбрасывает выбор тестовой карты при переходе к другому заказу. */
export const OrderRoute = () => {
  const { order } = useSyncExternalStore(checkout.subscribe, checkout.getSnapshot);

  return <OrderPage key={order?.id} />;
};
