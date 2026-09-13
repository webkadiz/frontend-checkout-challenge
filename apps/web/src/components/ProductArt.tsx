import { BagDayIcon, ClockDotIcon, LampOrbitIcon, MugLineIcon } from '../icons';
import classNames from 'classnames';
import style from '../App.module.scss';
import type { ComponentType } from 'react';

/** Выбор иллюстрации товара и её размера. */
export type ProductArtProps = {
  /** Идентификатор товара для выбора иллюстрации. */
  id: string;
  /** Использовать ли компактный вариант иллюстрации. */
  small?: boolean;
};

/** Иллюстрация товара и её дополнительное оформление. */
export type ProductArtVariant = {
  /** Компонент SVG-иллюстрации. */
  Icon: ComponentType;
  /** Дополнительный класс оформления иллюстрации. */
  className?: string;
};

const artwork = new Map<string, ProductArtVariant>([
  ['lamp-orbit', { Icon: LampOrbitIcon }],
  ['mug-line', { Icon: MugLineIcon, className: style.artMugLine }],
  ['bag-day', { Icon: BagDayIcon, className: style.artBagDay }],
  ['clock-dot', { Icon: ClockDotIcon, className: style.artClockDot }],
]);

const fallbackArtwork: ProductArtVariant = { Icon: ClockDotIcon };

/** Выбирает иллюстрацию товара и задаёт её фон и размер. */
export const ProductArt = ({ id, small = false }: ProductArtProps) => {
  const { Icon, className } = artwork.get(id) ?? fallbackArtwork;

  return (
    <div
      className={classNames(style.productArt, className, {
        [style.small]: small,
      })}
      aria-hidden="true"
    >
      <Icon />
    </div>
  );
};
