import { IconButton } from './ui';
import { Minus, Plus } from 'lucide-react';
import { quantityText } from '../constants/cart';
import classNames from 'classnames';
import style from './QuantityControl.module.scss';

/** Значение счётчика товара, ограничения и обработчик изменения. */
export type QuantityControlProps = {
  /** Название товара для доступных подписей кнопок. */
  title: string;
  /** Текущее количество товара. */
  quantity: number;
  /** Максимальное допустимое количество с учётом остатка. */
  max: number;
  /** Запрещены ли изменения количества. */
  busy: boolean;
  /** Показывать ли ожидание обновления этого товара. */
  loading?: boolean;
  /** Передаёт новое количество в пределах допустимого диапазона. */
  onChange: (quantity: number) => void;
};

/** Меняет количество в пределах остатка и показывает ожидание запроса. */
export const QuantityControl = ({
  title,
  quantity,
  max,
  busy,
  loading = false,
  onChange,
}: QuantityControlProps) => {
  const handleDecrease = () => {
    if (!busy && quantity > 0) onChange(quantity - 1);
  };

  const handleIncrease = () => {
    if (!busy && quantity < max) onChange(quantity + 1);
  };

  return (
    <div
      className={classNames(style.quantityControl, {
        [style.isLoading]: loading,
      })}
      role="group"
      aria-label={quantityText.label(title)}
      aria-busy={loading}
    >
      <IconButton
        type="button"
        aria-label={quantityText.decrease(title)}
        disabled={quantity === 0}
        aria-disabled={busy || quantity === 0}
        onClick={handleDecrease}
      >
        <Minus size={16} aria-hidden="true" />
      </IconButton>
      <span className={style.quantityValue}>
        <span className={style.quantityProgress} aria-hidden="true" />
        <output aria-label={quantityText.label(title)}>{quantity}</output>
      </span>
      <IconButton
        type="button"
        aria-label={quantityText.increase(title)}
        disabled={quantity >= max}
        aria-disabled={busy || quantity >= max}
        onClick={handleIncrease}
      >
        <Plus size={16} aria-hidden="true" />
      </IconButton>
    </div>
  );
};
