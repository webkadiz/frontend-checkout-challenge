import classNames from 'classnames';
import type { ComponentPropsWithRef } from 'react';
import style from './Skeleton.module.scss';

/** Настройки декоративной заглушки; размеры задаются классом или стилем. */
export type SkeletonProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'aria-hidden'>;

/** Сохраняет место под загружаемый контент и скрывает декорацию от скринридера. */
export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return <div {...props} className={classNames(style.skeleton, className)} aria-hidden="true" />;
};
