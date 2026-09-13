import { createHashRouter } from 'react-router';
import { App } from './App';
import { CatalogRoute } from './components/routes/CatalogRoute';
import { CheckoutRoute } from './components/routes/CheckoutRoute';
import { OrderRoute } from './components/routes/OrderRoute';
import { OrdersPage } from './components/OrdersPage';
import { SHOP_PATHS } from './constants/routes';
import { connectShopRouter } from './lib/navigation';

/** Создаёт hash-маршруты без требований к настройке статического хостинга. */
export function createShopRouter() {
  const router = createHashRouter([
    {
      element: <App />,
      children: [
        { path: SHOP_PATHS.catalog, element: <CatalogRoute /> },
        { path: SHOP_PATHS.checkout, element: <CheckoutRoute /> },
        { path: SHOP_PATHS.orders, element: <OrdersPage /> },
        { path: SHOP_PATHS.order, element: <OrderRoute /> },
        { path: SHOP_PATHS.legacyOrder, element: <OrderRoute /> },
        { path: '*', element: <CatalogRoute /> },
      ],
    },
  ]);

  connectShopRouter(router);

  return router;
}
