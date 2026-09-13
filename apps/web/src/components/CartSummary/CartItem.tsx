import type { Cart } from '@checkout/contracts';
import { Trash2 } from 'lucide-react';
import { Button } from '../ui';
import { QuantityControl } from '../QuantityControl';
import { ProductArt } from '../ProductArt';
import { cartText } from '../../constants/cart';
import { checkout } from '../../model/checkout';
import { rub } from '../../model/form';
import style from '../../App.module.scss';

/** Товар в корзине и состояние изменения его количества. */
type CartItemProps = {
  /** Позиция корзины для отображения. */
  item: Cart['items'][number];
  /** Максимальное доступное количество товара. */
  max: number;
  /** Заблокированы ли действия с корзиной. */
  busy: boolean;
  /** Обновляется ли сейчас именно эта позиция. */
  loading: boolean;
};

/** Позиция корзины с изменением количества и удалением товара. */
export const CartItem = ({ item, max, busy, loading }: CartItemProps) => {
  const handleQuantityChange = (next: number) => void checkout.updateItem(item.productId, next);

  const handleRemove = () => void checkout.updateItem(item.productId, 0);

  return (
    <div className={style.cartItem}>
      <ProductArt id={item.productId} small />
      <div className={style.cartItemInfo}>
        <strong>{item.title}</strong>
        <span>{rub(item.lineTotal)}</span>
        <div className={style.quantity}>
          <QuantityControl
            title={item.title}
            quantity={item.quantity}
            max={max}
            busy={busy}
            loading={loading}
            onChange={handleQuantityChange}
          />
          <Button
            className={style.remove}
            disabled={busy}
            aria-label={`${cartText.removeLabel}${item.title}`}
            onClick={handleRemove}
          >
            <Trash2 size={14} aria-hidden="true" /> {cartText.remove}
          </Button>
        </div>
      </div>
    </div>
  );
};
