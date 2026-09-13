import { Button } from './ui';
import { ShoppingBag, ReceiptText } from 'lucide-react';
import type { CheckoutStateProps } from './types';
import classNames from 'classnames';
import style from '../App.module.scss';
import { appText } from '../constants/app';
import { checkout } from '../model/checkout';
import { FullscreenMenu } from './FullscreenMenu';

/** Шапка магазина с меню и количеством товаров в корзине. */
export const SiteHeader = ({ state }: CheckoutStateProps) => {
  const handleOpenCatalog = () => checkout.navigate('catalog');

  const handleOpenOrders = () => checkout.navigate('orders');

  const handleOpenCheckout = () => {
    if (!state.busy) checkout.navigate('checkout');
  };

  return (
    <header className={style.siteHeader}>
      <Button className={style.wordmark} onClick={handleOpenCatalog}>
        {appText.brand}
        <span>{appText.registered}</span>
      </Button>
      <span className={style.headerDescription}>{appText.tagline}</span>
      <nav aria-label={appText.navigation}>
        <Button
          variant="navigation"
          className={style.headerOrderLink}
          disabled={!state.ready || state.busy}
          onClick={handleOpenOrders}
        >
          <ReceiptText size={16} aria-hidden="true" /> {appText.orders}
        </Button>
        <Button
          className={classNames(style.cartLink, {
            [style.active]: state.page === 'checkout',
          })}
          disabled={!state.ready}
          aria-disabled={!state.ready || state.busy}
          onClick={handleOpenCheckout}
        >
          <ShoppingBag size={16} aria-hidden="true" /> {appText.cart}
          <span>{state.cart?.quantity ?? 0}</span>
        </Button>
        <FullscreenMenu
          page={state.page}
          quantity={state.cart?.quantity ?? 0}
          canNavigate={state.ready && !state.busy}
          onNavigate={checkout.navigate}
        />
      </nav>
    </header>
  );
};
