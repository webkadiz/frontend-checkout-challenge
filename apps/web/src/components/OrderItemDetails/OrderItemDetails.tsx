import { orderText } from '../../constants/order';

/** Название товара и количество в заказе. */
type OrderItemDetailsProps = {
  /** Название товара. */
  title: string;
  /** Количество единиц товара. */
  quantity: number;
};

/** Название и количество товара для истории заказов и подробного состава. */
export const OrderItemDetails = ({ title, quantity }: OrderItemDetailsProps) => {
  return (
    <span>
      {title}
      <small>
        {quantity}
        {orderText.quantitySuffix}
      </small>
    </span>
  );
};
