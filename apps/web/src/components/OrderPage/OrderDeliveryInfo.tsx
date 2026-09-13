import type { Order } from '@checkout/contracts';
import type { Options } from '../../types';
import { orderText } from '../../constants/order';
import style from '../../App.module.scss';

/** Данные доставки для отображения в заказе. */
type OrderDeliveryInfoProps = {
  /** Заказ с выбранным способом и адресом доставки. */
  order: Order;
  /** Справочник способов доставки; null до загрузки. */
  options: Options | null;
};

/** Контакты покупателя и адрес выбранного способа доставки. */
export const OrderDeliveryInfo = ({ order, options }: OrderDeliveryInfoProps) => {
  const delivery = order.delivery;

  const pickupPoints = options?.deliveryMethods.find(
    (method) => method.id === 'pickup',
  )?.pickupPoints;

  const address =
    delivery.method === 'courier'
      ? `${orderText.courierPrefix}${Object.values(delivery.address).filter(Boolean).join(', ')}`
      : `${orderText.pickupPrefix}${pickupPoints?.find((point) => point.id === delivery.pickupPointId)?.address ?? delivery.pickupPointId}`;

  return (
    <div className={style.deliveryInfo}>
      <strong>{order.customer.name}</strong>
      <p>{order.customer.email}</p>
      <p>{address}</p>
    </div>
  );
};
