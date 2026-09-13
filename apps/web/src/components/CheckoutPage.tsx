import { Button } from './ui';
import { ArrowLeft } from 'lucide-react';
import type { CheckoutStateProps } from './types';
import style from '../App.module.scss';
import { appText } from '../constants/app';
import { checkout } from '../model/checkout';
import { CheckoutForm } from './CheckoutForm';
import { CartSummary } from './CartSummary';

/** Объединяет форму оформления и сводку текущей корзины. */
export const CheckoutPage = ({ state }: CheckoutStateProps) => {
  const handleOpenCatalog = () => checkout.navigate('catalog');

  return (
    <>
      <div className={style.pageIntro}>
        <Button variant="text" onClick={handleOpenCatalog}>
          <ArrowLeft size={16} aria-hidden="true" /> {appText.back}
        </Button>
        <h1>{appText.checkoutTitle}</h1>
        <p>{appText.checkoutHint}</p>
      </div>
      <div className={style.checkoutLayout}>
        <CheckoutForm />
        {state.cart && (
          <CartSummary
            cart={state.cart}
            products={state.products}
            quote={state.quote}
            busy={state.busy || state.orderUncertain}
            quoting={state.quoting}
            pendingProductId={state.pendingProductId}
          />
        )}
      </div>
    </>
  );
};
