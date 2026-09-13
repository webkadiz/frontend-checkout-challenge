import style from '../App.module.scss';
import { ADDRESS_FIELD_ROWS } from '../constants/checkout-form';

import { FormInput } from './CheckoutForm/FormInput';

/** Поля курьерского адреса с ошибками для каждого значения. */
export const AddressFields = () => {
  return (
    <>
      {ADDRESS_FIELD_ROWS.map((row) => (
        <div key={row.id} className={style.fieldRow}>
          {row.fields.map(({ name, label, placeholder, maxLength }) => (
            <FormInput
              key={name}
              name={`address.${name}`}
              label={label}
              placeholder={placeholder}
              maxLength={maxLength}
            />
          ))}
        </div>
      ))}
    </>
  );
};
