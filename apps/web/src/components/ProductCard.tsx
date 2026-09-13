import { QuantityControl } from './QuantityControl';
import style from '../App.module.scss';
import { catalogText } from '../constants/catalog';
import { checkout } from '../model/checkout';
import { rub } from '../model/form';
import { ProductArt } from './ProductArt';
import type { Product } from '@checkout/contracts';

/** Данные товара и состояние его добавления в корзину. */
export type ProductCardProps = {
  /** Товар для отображения. */
  product: Product;
  /** Порядковый индекс карточки для нумерации товаров. */
  index: number;
  /** Количество этого товара в корзине. */
  quantity: number;
  /** Заблокированы ли действия с корзиной. */
  busy: boolean;
  /** Обновляется ли количество именно этого товара. */
  loading: boolean;
};

/** Показывает товар, остаток и управление количеством в корзине. */
export const ProductCard = ({ product, index, quantity, busy, loading }: ProductCardProps) => {
  const handleQuantityChange = (next: number) => void checkout.updateItem(product.id, next);

  return (
    <article className={style.productCard}>
      <div className={style.artWrap}>
        <span className={style.productNumber}>
          {catalogText.numberPrefix}
          {index + 1}
        </span>
        {!product.stock && <span className={style.soldOut}>{catalogText.returning}</span>}
        <ProductArt id={product.id} />
      </div>
      <div className={style.productHeading}>
        <h2>{product.title}</h2>
        <span>{rub(product.price)}</span>
      </div>
      <p>{product.description}</p>
      <div className={style.productActions}>
        <div className={style.productActionsRow}>
          <span>{product.stock ? catalogText.inCart : catalogText.unavailable}</span>
          <QuantityControl
            title={product.title}
            quantity={quantity}
            max={product.stock}
            busy={busy}
            loading={loading}
            onChange={handleQuantityChange}
          />
        </div>
      </div>
    </article>
  );
};
