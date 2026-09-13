import { FieldFrame } from '../FieldFrame/FieldFrame';
import { useFieldAttributes } from '../../../hooks/useFieldAttributes';
import type { ComponentPropsWithRef } from 'react';

/** Свойства списка выбора с подписью и ошибкой. */
export type SelectFieldProps = ComponentPropsWithRef<'select'> & {
  /** Подпись списка выбора. */
  label: string;
  /** Ошибка проверки выбранного значения, если она есть. */
  error?: string;
};

/** Список выбора с теми же подписями, ошибками и доступностью, что у текстовых полей. */
export const SelectField = ({ label, error, ...props }: SelectFieldProps) => {
  const attributes = useFieldAttributes({ ...props, error });

  return (
    <FieldFrame id={attributes.id} label={label} error={error}>
      <select {...props} {...attributes} />
    </FieldFrame>
  );
};
