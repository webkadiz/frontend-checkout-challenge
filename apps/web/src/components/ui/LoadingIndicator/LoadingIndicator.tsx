import classNames from 'classnames';
import type { ComponentPropsWithRef } from 'react';
import style from './LoadingIndicator.module.scss';

/** Свойства индикатора ожидания с доступной текстовой подписью. */
export type LoadingIndicatorProps = ComponentPropsWithRef<'span'> & {
  /** Описание выполняемого действия. */
  label: string;
};

/** Показывает анимированные точки; способ объявления загрузки задаёт контейнер. */
export const LoadingIndicator = ({ label, className, ...props }: LoadingIndicatorProps) => {
  return (
    <span {...props} className={classNames(style.indicator, className)}>
      <span className={style.dots} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>{label}</span>
    </span>
  );
};
