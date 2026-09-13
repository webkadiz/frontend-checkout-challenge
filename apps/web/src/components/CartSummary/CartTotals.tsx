import { useEffect, useState } from 'react';
import type { Quote } from '@checkout/contracts';
import { cartText } from '../../constants/cart';
import { rub } from '../../model/form';
import { DescriptionList, DescriptionItem, LoadingIndicator } from '../ui';
import style from '../../App.module.scss';

/** Суммы корзины и состояние обновления расчёта. */
type CartTotalsProps = {
  /** Стоимость товаров без доставки в копейках. */
  subtotal: number;
  /** Расчёт доставки и итогов; null, если он ещё недоступен. */
  quote: Quote | null;
  /** Нужно ли показать ожидание нового расчёта. */
  recalculating: boolean;
};

/** Подбирает подпись доставки для текущего серверного расчёта. */
const deliveryLabel = (quote: Quote | null, recalculating: boolean) => {
  if (quote) return quote.shipping ? rub(quote.shipping) : cartText.free;

  return recalculating ? cartText.calculating : cartText.chooseAddress;
};

/** Сохраняет предыдущую сумму во время пересчёта и показывает актуальную доставку. */
export const CartTotals = ({ subtotal, quote, recalculating }: CartTotalsProps) => {
  // Предыдущая сумма нужна только для отображения; модель не использует устаревший расчёт.
  const [previousQuote, setPreviousQuote] = useState(quote);

  useEffect(() => {
    if (quote || !recalculating) setPreviousQuote(quote);
  }, [quote, recalculating]);

  const displayedQuote = quote ?? (recalculating ? previousQuote : null);
  const total = displayedQuote?.total ?? subtotal;

  return (
    <>
      <DescriptionList>
        <DescriptionItem label={cartText.products}>{rub(subtotal)}</DescriptionItem>
        <DescriptionItem label={cartText.delivery}>
          {deliveryLabel(displayedQuote, recalculating)}
        </DescriptionItem>
        <DescriptionItem
          label={cartText.total}
          prominent
          valueProps={{ 'aria-live': 'polite', 'aria-busy': recalculating }}
        >
          <span key={total} className={style.totalAmount}>
            {rub(total)}
          </span>
        </DescriptionItem>
      </DescriptionList>
      <p className={style.summaryStatus} role="status">
        {recalculating ? (
          <LoadingIndicator label={cartText.updating} />
        ) : !quote ? (
          cartText.subtotalHint
        ) : null}
      </p>
    </>
  );
};
