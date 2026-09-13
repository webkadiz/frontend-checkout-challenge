import { useMemo } from 'react';
import type { Quote, Cart, Product } from '@checkout/contracts';
import { cartText } from '../../constants/cart';
import { CartItem } from './CartItem';
import { CartTotals } from './CartTotals';
import style from '../../App.module.scss';

/** Содержимое корзины и состояние пересчёта итогов. */
export type CartSummaryProps = {
  /** Текущая корзина с позициями и суммами. */
  cart: Cart;
  /** Каталог для получения доступных остатков. */
  products: Product[];
  /** Последний расчёт заказа; null до первого успешного расчёта. */
  quote: Quote | null;
  /** Заблокированы ли действия с корзиной. */
  busy: boolean;
  /** Выполняется ли пересчёт стоимости заказа. */
  quoting: boolean;
  /** Идентификатор изменяемого товара; null, если изменения нет. */
  pendingProductId: string | null;
};

/** Собирает позиции корзины и итоговые суммы с учётом серверного пересчёта. */
export const CartSummary = ({
  cart,
  products,
  quote,
  busy,
  quoting,
  pendingProductId,
}: CartSummaryProps) => {
  const stocks = useMemo(() => {
    const index = new Map<string, number>();

    for (const product of products) index.set(product.id, product.stock);

    return index;
  }, [products]);

  return (
    <aside className={style.summary}>
      <div className={style.summaryTitle}>
        <h2>{cartText.title}</h2>
        <span>
          {cart.quantity}
          {cartText.quantitySuffix}
        </span>
      </div>
      {cart.items.map((item) => (
        <CartItem
          key={item.productId}
          item={item}
          max={stocks.get(item.productId) ?? 0}
          busy={busy}
          loading={pendingProductId === item.productId}
        />
      ))}
      <CartTotals
        subtotal={cart.subtotal}
        quote={quote}
        recalculating={quoting || pendingProductId !== null}
      />
      <p className={style.finePrint}>{cartText.confirmation}</p>
    </aside>
  );
};
