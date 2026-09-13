import { useSyncExternalStore } from 'react';
import { checkout } from '../../model/checkout';
import { Catalog } from '../Catalog';

/** Передаёт каталогу актуальную корзину и состояние запросов. */
export const CatalogRoute = () => {
  const state = useSyncExternalStore(checkout.subscribe, checkout.getSnapshot);

  return (
    <Catalog
      products={state.products}
      cart={state.cart}
      busy={state.busy || state.orderUncertain}
      pendingProductId={state.pendingProductId}
    />
  );
};
