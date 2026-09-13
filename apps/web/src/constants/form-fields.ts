import type { CheckoutFieldMap } from '../hooks/types';

export const CHECKOUT_FIELD_PATHS: CheckoutFieldMap = {
  name: 'customer.name',
  email: 'customer.email',
  phone: 'customer.phone',
  pickupPointId: 'pickupPointId',
  city: 'address.city',
  street: 'address.street',
  house: 'address.house',
  apartment: 'address.apartment',
};
