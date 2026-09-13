import classNames from 'classnames';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import style from './DescriptionList.module.scss';

/** Стандартные свойства списка пар «подпись — значение». */
export type DescriptionListProps = ComponentPropsWithRef<'dl'>;

/** Свойства строки списка описаний. */
export type DescriptionItemProps = ComponentPropsWithRef<'div'> & {
  /** Подпись значения. */
  label: ReactNode;
  /** Выделить ли строку как итоговую. */
  prominent?: boolean;
  /** Атрибуты значения, включая объявления обновления для скринридера. */
  valueProps?: ComponentPropsWithRef<'dd'>;
};

/** Семантический список описаний с общими отступами. */
export const DescriptionList = ({ className, ...props }: DescriptionListProps) => {
  return <dl {...props} className={classNames(style.list, className)} />;
};

/** Выравнивает подпись и значение, не форматируя прикладные данные. */
export const DescriptionItem = ({
  label,
  prominent = false,
  valueProps,
  children,
  className,
  ...props
}: DescriptionItemProps) => {
  return (
    <div {...props} className={classNames(style.item, { [style.prominent]: prominent }, className)}>
      <dt>{label}</dt>
      <dd {...valueProps}>{children}</dd>
    </div>
  );
};
