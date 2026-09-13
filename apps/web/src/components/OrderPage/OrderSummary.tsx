import type { Order } from '@checkout/contracts';
import type { Options } from '../../types';
import { orderText } from '../../constants/order';
import { rub } from '../../model/form';
import { OrderDeliveryInfo } from './OrderDeliveryInfo';
import { OrderItemDetails } from '../OrderItemDetails';
import { DescriptionList, DescriptionItem } from '../ui';
import style from '../../App.module.scss';

/** Состав, суммы и доставка оформленного заказа. */
type OrderSummaryProps = {
  /** Заказ для отображения. */
  order: Order;
  /** Справочник доставки и оплаты; null до загрузки. */
  options: Options | null;
};

/** Состав, серверные суммы и контактные данные оформленного заказа. */
export const OrderSummary = ({ order, options }: OrderSummaryProps) => {
  return (
    <aside className={style.summary}>
      <h2>{order.number}</h2>
      <p className={style.finePrint}>{orderText.summary}</p>
      {order.items.map((item) => (
        <div className={style.orderItem} key={item.productId}>
          <OrderItemDetails title={item.title} quantity={item.quantity} />
          <strong>{rub(item.lineTotal)}</strong>
        </div>
      ))}
      <DescriptionList>
        <DescriptionItem label={orderText.delivery}>{rub(order.shipping)}</DescriptionItem>
        <DescriptionItem label={orderText.total} prominent>
          {rub(order.total)}
        </DescriptionItem>
      </DescriptionList>
      <OrderDeliveryInfo order={order} options={options} />
    </aside>
  );
};
