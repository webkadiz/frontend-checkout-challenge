import { generatePath, matchPath } from 'react-router';
import { SHOP_PATHS } from '../constants/routes';
import type { Page, HistoryMode, NavigationListener, ShopRouter } from './types';

let router: ShopRouter | undefined;

/** Подключает единственный роутер приложения к независимой модели заказов. */
export function connectShopRouter(next: ShopRouter) {
  router = next;

  return () => {
    if (router === next) router = undefined;
  };
}

/** Определяет текущий экран через маршрутизатор, без ручного разбора hash. */
export function browserPage(): Page | null {
  if (!router) return null;

  const path = router.state.location.pathname;

  if (matchPath(SHOP_PATHS.order, path) || path === SHOP_PATHS.legacyOrder) return 'order';

  if (matchPath(SHOP_PATHS.checkout, path)) return 'checkout';

  if (matchPath(SHOP_PATHS.orders, path)) return 'orders';

  return 'catalog';
}

/** Извлекает параметр заказа через сопоставление маршрута React Router. */
export function browserOrderId(): string | null {
  const path = router?.state.location.pathname;
  const id = path ? matchPath(SHOP_PATHS.order, path)?.params.orderId : null;

  try {
    return id ? decodeURIComponent(id) : null;
  } catch {
    return null;
  }
}

/** Выполняет переход через React Router, не дублируя текущий адрес. */
export function writeBrowserPage(page: Page, mode: HistoryMode, orderId?: string) {
  if (!router) return;

  const path =
    page === 'order'
      ? orderId
        ? generatePath(SHOP_PATHS.order, { orderId })
        : SHOP_PATHS.legacyOrder
      : SHOP_PATHS[page];

  if (router.state.location.pathname === path) return;

  void router.navigate(path, { replace: mode === 'replace' });
}

/** Следит за сменой маршрута, включая кнопки браузера и прямые hash-ссылки. */
export function listenToBrowserNavigation(onNavigate: NavigationListener) {
  if (!router) return () => {};

  let previous = router.state.location.pathname;

  return router.subscribe((state) => {
    if (state.location.pathname === previous) return;

    previous = state.location.pathname;
    onNavigate(browserPage() ?? 'catalog', browserOrderId());
  });
}
