import style from './FormSection.module.scss';
import classNames from 'classnames';
import type { ComponentPropsWithRef } from 'react';

/** Группа полей формы с заголовком и номером шага. */
export type FormSectionProps = ComponentPropsWithRef<'fieldset'> & {
  /** Обозначение шага, если нужна нумерация. */
  step?: string;
  /** Заголовок группы полей. */
  title: string;
};

/** Группирует поля формы с заголовком и необязательным номером шага. */
export const FormSection = ({ step, title, className, children, ...props }: FormSectionProps) => {
  return (
    <fieldset {...props} className={classNames(style.section, className)}>
      <legend>
        {step && <span>{step}</span>}
        {title}
      </legend>
      {children}
    </fieldset>
  );
};
