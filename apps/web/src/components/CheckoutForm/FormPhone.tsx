import { useController, useFormContext } from 'react-hook-form';
import type { Draft } from '../../model/types';
import { PhoneField } from '../PhoneField';

/** Подключает маску к форме, сохраняя порядок фокусировки ошибочных полей. */
export const FormPhone = () => {
  const { control } = useFormContext<Draft>();
  const { field, fieldState } = useController({ control, name: 'customer.phone' });

  return (
    <PhoneField
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      error={fieldState.error?.message}
    />
  );
};
