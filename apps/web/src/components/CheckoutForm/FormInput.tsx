import { useController, useFormContext } from 'react-hook-form';
import type { FieldPathByValue } from 'react-hook-form';
import type { Draft } from '../../model/types';
import { Field } from '../ui';
import type { FieldProps } from '../ui';

/** Свойства текстового поля, подключённого к форме оформления. */
export type FormInputProps = Omit<
  FieldProps,
  'name' | 'value' | 'onChange' | 'onBlur' | 'error'
> & {
  /** Путь к строковому полю черновика заказа. */
  name: FieldPathByValue<Draft, string>;
};

/** Подключает обычное поле к форме и показывает ошибку после взаимодействия. */
export const FormInput = ({ name, ...props }: FormInputProps) => {
  const { control } = useFormContext<Draft>();
  const { field, fieldState } = useController({ control, name });

  return <Field {...props} {...field} error={fieldState.error?.message} />;
};
