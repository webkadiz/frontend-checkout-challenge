import type { FieldErrors, Resolver } from 'react-hook-form';
import type { Draft } from './types';
import { validate } from './form';

/** Адаптирует общую проверку черновика к вложенным ошибкам React Hook Form. */
export const checkoutResolver: Resolver<Draft> = (values) => {
  const fields = validate(values);
  const errors: FieldErrors<Draft> = {};

  for (const name of ['name', 'email', 'phone'] as const) {
    if (fields[name]) {
      errors.customer ??= {};
      errors.customer[name] = { type: 'validate', message: fields[name] };
    }
  }

  for (const name of ['city', 'street', 'house', 'apartment'] as const) {
    if (fields[name]) {
      errors.address ??= {};
      errors.address[name] = { type: 'validate', message: fields[name] };
    }
  }

  if (fields.pickupPointId)
    errors.pickupPointId = { type: 'validate', message: fields.pickupPointId };

  return Object.keys(errors).length ? { values: {}, errors } : { values, errors: {} };
};
