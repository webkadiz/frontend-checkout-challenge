import { ArrowUpRight } from 'lucide-react';
import { catalogText } from '../constants/catalog';
import style from '../App.module.scss';
import { useMemo } from 'react';
import { ProductCard } from './ProductCard';
import type { Cart, Product } from '@checkout/contracts';

/** Каталог товаров и состояние корзины. */
export type CatalogProps = {
  /** Товары для отображения в каталоге. */
  products: Product[];
  /** Корзина текущей сессии; null до загрузки. */
  cart: Cart | null;
  /** Заблокированы ли действия с корзиной. */
  busy: boolean;
  /** Идентификатор товара, для которого отправлено изменение количества. */
  pendingProductId: string | null;
};

/** Показывает каталог и переиспользует индекс количества товаров в корзине. */
export const Catalog = ({ products, cart, busy, pendingProductId }: CatalogProps) => {
  const quantities = useMemo(() => {
    const index = new Map<string, number>();

    for (const item of cart?.items ?? []) index.set(item.productId, item.quantity);

    return index;
  }, [cart]);

  return (
    <>
      <section className={style.hero}>
        <div>
          <p className={style.eyebrow}>{catalogText.eyebrow}</p>
          <h1>
            {catalogText.title}
            <br />
            <em>{catalogText.emphasis}</em>
          </h1>
        </div>
        <p className={style.heroNote}>
          {catalogText.descriptionStart}
          <br />
          {catalogText.descriptionMiddle}
          <br />
          {catalogText.descriptionEnd}
        </p>
      </section>
      <div className={style.sectionCaption}>
        <span>{catalogText.caption}</span>
        <span>
          {products.length}
          {catalogText.countSuffix}
        </span>
      </div>
      <section className={style.productGrid} aria-label={catalogText.label}>
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            quantity={quantities.get(product.id) ?? 0}
            busy={busy}
            loading={pendingProductId === product.id}
          />
        ))}
      </section>
      <div className={style.editorialNote}>
        <span>{catalogText.editorialTitle}</span>
        <p>
          {catalogText.editorialStart}
          <br />
          {catalogText.editorialEnd}
        </p>
        <span aria-hidden="true">
          <ArrowUpRight size="1em" aria-hidden="true" />
        </span>
      </div>
    </>
  );
};
