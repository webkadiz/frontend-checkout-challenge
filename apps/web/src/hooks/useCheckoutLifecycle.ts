import { useEffect } from 'react';
import { checkout } from '../model/checkout';
import { listenToBrowserNavigation } from '../lib/navigation';

/** Восстанавливает магазин и связывает модель с историей и уходом со страницы. */
export function useCheckoutLifecycle() {
  useEffect(() => {
    const stopNavigation = listenToBrowserNavigation(checkout.restoreNavigation);

    void checkout.boot();

    const leave = () => checkout.close();

    window.addEventListener('pagehide', leave);

    const resume = (event: PageTransitionEvent) => {
      if (event.persisted) void checkout.boot();
    };

    window.addEventListener('pageshow', resume);

    return () => {
      stopNavigation();
      leave();
      window.removeEventListener('pagehide', leave);
      window.removeEventListener('pageshow', resume);
    };
  }, []);
}
