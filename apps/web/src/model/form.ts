import type { Draft, OrderPaymentState } from './types';
import { ADDRESS_VALIDATION_RULES, validationText } from '../constants/validation';
import type { Delivery } from '@checkout/contracts';
import { isPossiblePhoneNumber } from 'react-phone-number-input/input';

export const initialDraft: Draft = {
  customer: { name: '', email: '', phone: '' },
  method: 'pickup',
  pickupPointId: 'point-center',
  address: { city: '', street: '', house: '', apartment: '' },
  paymentMethod: 'card',
};

/** Преобразует черновик формы в один из вариантов доставки API. */
export function deliveryOf(draft: Draft): Delivery {
  return draft.method === 'pickup'
    ? { method: 'pickup', pickupPointId: draft.pickupPointId }
    : { method: 'courier', address: { ...draft.address } };
}

// Формат email совпадает с API, включая точки в локальной части и сегменты домена.
const emailPattern =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

/** Проверяет обязательность, длину и формат email по правилам API. */
export function emailError(email: string): string | undefined {
  if (!email.trim()) return validationText.emailRequired;

  if (email.length > 150) return validationText.emailTooLong;

  if (!emailPattern.test(email)) return validationText.emailInvalid;
}

/** Проверяет контакты и доставку; при пересчёте может пропустить контакты. */
export function validate(draft: Draft, contacts = true) {
  const errors: Record<string, string> = {};

  if (contacts) {
    if (draft.customer.name.trim().length < 2 || draft.customer.name.length > 100)
      errors.name = validationText.nameInvalid;

    const email = emailError(draft.customer.email);

    if (email) errors.email = email;

    if (
      !/^\+[1-9]\d{9,14}$/.test(draft.customer.phone) ||
      !isPossiblePhoneNumber(draft.customer.phone)
    )
      errors.phone = validationText.phoneInvalid;
  }

  if (draft.method === 'pickup' && !draft.pickupPointId)
    errors.pickupPointId = validationText.pickupRequired;

  if (draft.method === 'courier') {
    for (const { name, min, max } of ADDRESS_VALIDATION_RULES) {
      const value = draft.address[name];

      if (value.trim().length < min || value.length > max) {
        errors[name] = validationText.lengthRange(min, max);
      }
    }

    if (draft.address.apartment.length > 20) errors.apartment = validationText.apartmentTooLong;
  }

  return errors;
}

/** Считает заказ оплаченным только при согласованных статусах заказа и платежа. */
export const isPaid = (order: OrderPaymentState) =>
  order.status === 'paid' && order.paymentStatus === 'succeeded';

export const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});

/** Форматирует сумму в копейках для отображения в рублях. */
export const rub = (kopecks: number) => money.format(kopecks / 100);
