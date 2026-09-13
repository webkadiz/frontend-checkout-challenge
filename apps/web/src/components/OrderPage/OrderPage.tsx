import { Alert, Button, LoadingIndicator } from '../ui';
import { ArrowLeft } from 'lucide-react';
import { orderText } from '../../constants/order';
import style from '../../App.module.scss';
import { useState, useSyncExternalStore } from 'react';
import { checkout } from '../../model/checkout';
import {
  paymentPhase,
  paymentComplete,
  paymentWaiting,
  canStartPayment,
} from '../../model/payment-state';
import { OrderStatus } from './OrderStatus';
import { PaymentPanel } from './PaymentPanel';
import { OrderSummary } from './OrderSummary';

/** Показывает заказ и тестовую оплату; успех зависит от подтверждения сервера. */
export const OrderPage = () => {
  const { order, payment, orderLoading, sandbox, simulation, options } = useSyncExternalStore(
    checkout.subscribe,
    checkout.getSnapshot,
  );

  const busy = checkout.state.busy || orderLoading;
  const [card, setCard] = useState('success');

  if (!order) return null;

  const phase = paymentPhase(order, payment, orderLoading);
  const complete = paymentComplete(phase);
  const processing = paymentWaiting(phase);

  const handleOpenOrders = () => checkout.navigate('orders');

  const handleStartPayment = () => void checkout.startPayment();

  const handlePay = () => void checkout.simulate(simulation ?? (card as 'success' | 'decline'));

  const handleCancelPayment = () => void checkout.simulate('cancel');

  const handleRefreshOrder = () => void checkout.refreshOrder();

  const handleOpenCatalog = () => checkout.navigate('catalog');

  return (
    <div className={style.orderLayout}>
      <section className={style.orderMain}>
        <Button variant="text" className={style.orderBack} onClick={handleOpenOrders}>
          <ArrowLeft size={16} aria-hidden="true" /> {orderText.back}
        </Button>
        <OrderStatus number={order.number} phase={phase} />
        {canStartPayment(phase) && (
          <Button variant="primary" aria-busy={busy} disabled={busy} onClick={handleStartPayment}>
            {busy ? (
              <LoadingIndicator label={orderText.opening} />
            ) : payment ? (
              orderText.retryPayment
            ) : (
              orderText.openPayment
            )}
          </Button>
        )}
        {phase === 'choosing_card' && (
          <PaymentPanel
            total={order.total}
            sandbox={sandbox}
            card={card}
            busy={busy}
            simulation={simulation}
            onCardChange={setCard}
            onPay={handlePay}
            onCancel={handleCancelPayment}
          />
        )}
        {processing && (
          <Alert>
            <LoadingIndicator
              label={phase === 'verifying_order' ? orderText.verifying : orderText.processing}
            />
          </Alert>
        )}
        {!complete && (
          <Button variant="text" disabled={busy} onClick={handleRefreshOrder}>
            {orderText.refresh}
          </Button>
        )}
        <Button variant="text" disabled={busy} onClick={handleOpenCatalog}>
          {complete ? orderText.returnToProducts : orderText.returnToCatalog}
        </Button>
      </section>
      <OrderSummary order={order} options={options} />
    </div>
  );
};
