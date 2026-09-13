import type { CheckoutState } from '../model/types';

/** Общее состояние магазина для составных компонентов. */
export type CheckoutStateProps = {
  /** Актуальный снимок модели оформления заказа. */
  state: CheckoutState;
};
