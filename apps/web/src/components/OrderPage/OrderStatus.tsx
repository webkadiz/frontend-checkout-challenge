import { ArrowUpRight, Check, Clock } from 'lucide-react';
import classNames from 'classnames';
import type { Order } from '@checkout/contracts';
import type { PaymentPhase } from '../../model/types';
import { paymentCopy } from '../../constants/payment';
import { orderText } from '../../constants/order';
import { paymentComplete, paymentWaiting } from '../../model/payment-state';
import style from '../../App.module.scss';

/** Номер заказа и этап его оплаты. */
type OrderStatusProps = {
  /** Номер заказа, отображаемый покупателю. */
  number: Order['number'];
  /** Текущее состояние интерфейса оплаты. */
  phase: PaymentPhase;
};

/** Показывает подтверждённый сервером этап заказа и его пояснение. */
export const OrderStatus = ({ number, phase }: OrderStatusProps) => {
  const complete = paymentComplete(phase);
  const processing = paymentWaiting(phase);

  return (
    <>
      <p className={style.eyebrow}>
        {orderText.eyebrow}
        {number}
      </p>
      <div
        className={classNames(style.orderMark, { [style.success]: complete })}
        aria-hidden="true"
      >
        {complete ? (
          <Check size={30} />
        ) : processing ? (
          <Clock size={30} />
        ) : (
          <ArrowUpRight size={30} />
        )}
      </div>
      <h1>{paymentCopy[phase].title}</h1>
      <p className={style.orderLead}>{paymentCopy[phase].description}</p>
    </>
  );
};
