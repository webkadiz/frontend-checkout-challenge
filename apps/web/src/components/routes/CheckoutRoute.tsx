import { useSyncExternalStore } from 'react';
import { checkout } from '../../model/checkout';
import { CheckoutPage } from '../CheckoutPage';
import { Empty, Button } from '../ui';
import { appText } from '../../constants/app';

/** Показывает оформление или предложение вернуться к покупкам для пустой корзины. */
export const CheckoutRoute = () => {
  const state = useSyncExternalStore(checkout.subscribe, checkout.getSnapshot);

  const handleOpenCatalog = () => checkout.navigate('catalog');

  if (state.cart?.items.length || state.orderUncertain) return <CheckoutPage state={state} />;

  return (
    <Empty title={appText.emptyTitle}>
      <p>{appText.emptyHint}</p>
      <Button variant="primary" onClick={handleOpenCatalog}>
        {appText.browse}
      </Button>
    </Empty>
  );
};
