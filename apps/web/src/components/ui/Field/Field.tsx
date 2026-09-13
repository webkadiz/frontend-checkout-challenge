import { FieldFrame } from '../FieldFrame/FieldFrame';
import { useFieldAttributes } from '../../../hooks/useFieldAttributes';
import type { ComponentPropsWithRef } from 'react';

/** Свойства текстового поля с подписью и ошибкой. */
export type FieldProps = ComponentPropsWithRef<'input'> & {
  /** Подпись поля для пользователя. */
  label: string;
  /** Ошибка проверки поля; отсутствие значения скрывает сообщение. */
  error?: string;
};

/** Текстовое поле с общей подписью, ошибкой и поддержкой ref формы. */
export const Field = ({ label, error, ...props }: FieldProps) => {
  const attributes = useFieldAttributes({ ...props, error });

  return (
    <FieldFrame id={attributes.id} label={label} error={error}>
      <input {...props} {...attributes} />
    </FieldFrame>
  );
};
