import { ArrowRight } from 'lucide-react';
import { ordersText } from '../constants/orders';
import classNames from 'classnames';
import style from '../App.module.scss';
import { useEffect, useSyncExternalStore } from 'react';
import { checkout } from '../model/checkout';
import { OrderCard } from './OrderCard';
import { Empty, Button, LoadingIndicator } from './ui';

/** Показывает историю заказов текущей гостевой сессии. */
export const OrdersPage = () => {
  const { orders, busy, ordersLoading } = useSyncExternalStore(
    checkout.subscribe,
    checkout.getSnapshot,
  );

  useEffect(() => {
    void checkout.refreshOrders();
  }, []);

  const handleRefreshOrders = () => void checkout.refreshOrders();

  const handleOpenCatalog = () => checkout.navigate('catalog');

  return (
    <section>
      <div className={classNames(style.pageIntro, style.ordersIntro)}>
        <div>
          <p className={style.eyebrow}>{ordersText.eyebrow}</p>
          <h1>{ordersText.title}</h1>
          <p>{ordersText.description}</p>
        </div>
        <Button
          variant="secondary"
          className={style.ordersRefresh}
          disabled={busy || ordersLoading}
          onClick={handleRefreshOrders}
        >
          {ordersLoading ? <LoadingIndicator label={ordersText.refreshing} /> : ordersText.refresh}
        </Button>
      </div>
      {!orders.length ? (
        <Empty title={ordersText.emptyTitle}>
          <p>{ordersText.emptyHint}</p>
          <Button variant="primary" onClick={handleOpenCatalog}>
            {ordersText.browse} <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </Empty>
      ) : (
        <div className={style.ordersList} aria-label={ordersText.list} aria-busy={ordersLoading}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} busy={busy} />
          ))}
        </div>
      )}
      <p className={style.finePrint}>{ordersText.disclaimer}</p>
    </section>
  );
};
