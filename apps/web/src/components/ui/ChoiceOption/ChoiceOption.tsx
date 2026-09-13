import classNames from 'classnames';
import style from './ChoiceOption.module.scss';
import type { ComponentPropsWithRef } from 'react';

/** Свойства варианта выбора с заголовком и пояснением. */
export type ChoiceOptionProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'title'> & {
  /** Основная подпись варианта. */
  title: string;
  /** Дополнительное пояснение варианта. */
  hint?: string;
};

/** Доступный вариант выбора с заголовком, пояснением и состоянием поля. */
export const ChoiceOption = ({ checked, title, hint, ...props }: ChoiceOptionProps) => {
  return (
    <label className={classNames(style.choice, { [style.active]: checked })}>
      <input {...props} type="radio" checked={checked} />
      <strong>{title}</strong>
      {hint && <small>{hint}</small>}
    </label>
  );
};
