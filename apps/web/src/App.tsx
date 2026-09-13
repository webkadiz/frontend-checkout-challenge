import { useSyncExternalStore } from 'react';
import style from './App.module.scss';
import { checkout } from './model/checkout';
import { useCheckoutLifecycle } from './hooks/useCheckoutLifecycle';
import { SiteHeader } from './components/SiteHeader';
import { ShopContent } from './components/ShopContent';
import { SiteFeedback } from './components/SiteFeedback';
import { SiteFooter } from './components/SiteFooter';

/** Собирает каркас магазина и подключает состояние и жизненный цикл приложения. */
export const App = () => {
  const state = useSyncExternalStore(checkout.subscribe, checkout.getSnapshot);

  useCheckoutLifecycle();

  return (
    <div className={style.site}>
      <SiteHeader state={state} />
      <main>
        <SiteFeedback
          error={state.error}
          onRetry={checkout.retry}
          onNewSession={checkout.newSession}
        />
        <ShopContent state={state} />
      </main>
      <SiteFooter />
    </div>
  );
};
