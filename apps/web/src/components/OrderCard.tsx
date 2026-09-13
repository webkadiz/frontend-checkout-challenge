import { Button } from './ui';
import { ArrowRight } from 'lucide-react';
import classNames from 'classnames';
import style from '../App.module.scss';
import { ordersText } from '../constants/orders';
import { checkout } from '../model/checkout';
import { orderStatus } from '../model/order-status';
import { rub } from '../model/form';
import { ProductArt } from './ProductArt';
import type { Order } from '@checkout/contracts';
import { OrderItemDetails } from './OrderItemDetails';

/** Данные заказа в списке покупок. */
export type OrderCardProps = {
  /** Заказ для отображения. */
  order: Order;
  /** Заблокирован ли переход к заказу. */
  busy: boolean;
};

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Краткая карточка заказа с составом, суммой и серверным статусом. */
export const OrderCard = ({ order, busy }: OrderCardProps) => {
  const status = orderStatus(order);

  const handleOpenOrder = () => void checkout.openOrder(order.id);

  return (
    <article className={style.orderCard}>
      <div className={style.orderCardHeading}>
        <div>
          <h2>
            {ordersText.orderPrefix}
            {order.number}
          </h2>
          <time dateTime={order.createdAt}>{dateFormat.format(new Date(order.createdAt))}</time>
        </div>
        <span className={classNames(style.orderStatus, style[status.tone])}>{status.label}</span>
      </div>
      <div className={style.orderCardBody}>
        <div className={style.orderCardItems}>
          {order.items.map((item) => (
            <div className={style.orderPreview} key={item.productId}>
              <ProductArt id={item.productId} small />
              <OrderItemDetails title={item.title} quantity={item.quantity} />
            </div>
          ))}
        </div>
        <div className={style.orderCardTotal}>
          <strong>{rub(order.total)}</strong>
          <span>
            {order.delivery.method === 'courier' ? ordersText.courier : ordersText.pickup}
          </span>
          <Button
            variant="secondary"
            disabled={busy}
            aria-label={`${ordersText.openOrder}${order.number}`}
            onClick={handleOpenOrder}
          >
            {ordersText.details} <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
};
