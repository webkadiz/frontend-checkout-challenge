import type { Draft } from '../model/types';
import type { FieldPath } from 'react-hook-form';

/** Типобезопасный путь к полю черновика оформления заказа. */
export type CheckoutFieldPath = FieldPath<Draft>;

/** Соответствие серверных путей ошибок полям формы оформления. */
export type CheckoutFieldMap = Record<string, CheckoutFieldPath>;
