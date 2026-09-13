import { useId } from 'react';
import type { ComponentPropsWithRef } from 'react';

/** Атрибуты доступности поля и его ошибка проверки. */
export type FieldAttributesOptions = Pick<
  ComponentPropsWithRef<'input'>,
  'id' | 'aria-labelledby' | 'aria-describedby' | 'aria-invalid'
> & {
  /** Ошибка, для которой формируются aria-invalid и ссылка на сообщение. */
  error?: string;
};

/** Связывает контрол с подписью и ошибкой, сохраняя внешние описания и заданный id. */
export const useFieldAttributes = (options: FieldAttributesOptions) => {
  const generatedId = useId();
  const id = options.id ?? generatedId;
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  return {
    id,
    'aria-labelledby': [labelId, options['aria-labelledby']].filter(Boolean).join(' '),
    'aria-describedby':
      [options['aria-describedby'], options.error && errorId].filter(Boolean).join(' ') ||
      undefined,
    'aria-invalid': options.error ? true : (options['aria-invalid'] ?? false),
  };
};
