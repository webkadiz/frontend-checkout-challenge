import type { Scenario } from '@checkout/contracts';
import type { Sandbox } from '../../types';
import { orderText } from '../../constants/order';
import { rub } from '../../model/form';
import { Button, LoadingIndicator } from '../ui';
import { PaymentCardOption } from './PaymentCardOption';
import style from '../../App.module.scss';

/** Состояние и действия панели тестовой оплаты. */
type PaymentPanelProps = {
  /** Сумма к оплате в копейках. */
  total: number;
  /** Доступные тестовые карты; null до загрузки. */
  sandbox: Sandbox | null;
  /** Выбранный сценарий тестовой карты. */
  card: string;
  /** Отправляется ли запрос, блокирующий действия оплаты. */
  busy: boolean;
  /** Сценарий неподтверждённой симуляции для безопасного повтора. */
  simulation: Scenario | null;
  /** Меняет сценарий выбранной тестовой карты. */
  onCardChange: (scenario: string) => void;
  /** Запускает оплату или повторяет неподтверждённую попытку. */
  onPay: () => void;
  /** Отменяет текущую попытку оплаты. */
  onCancel: () => void;
};

/** Выбор тестовой карты и действия оплаты с блокировкой повторной отправки. */
export const PaymentPanel = ({
  total,
  sandbox,
  card,
  busy,
  simulation,
  onCardChange,
  onPay,
  onCancel,
}: PaymentPanelProps) => {
  return (
    <div className={style.paymentBox}>
      <p className={style.eyebrow}>{orderText.paymentEyebrow}</p>
      <h2>{rub(total)}</h2>
      {sandbox?.cards.map((item) => (
        <PaymentCardOption
          key={item.id}
          card={item}
          selected={card === item.scenario}
          disabled={busy || !!simulation}
          onSelect={onCardChange}
        />
      ))}
      <Button variant="primary" fullWidth aria-busy={busy} disabled={busy} onClick={onPay}>
        {busy ? (
          <LoadingIndicator label={orderText.sending} />
        ) : simulation ? (
          orderText.retryAction
        ) : (
          `${orderText.pay}${rub(total)}`
        )}
      </Button>
      <Button variant="text" disabled={busy || !!simulation} onClick={onCancel}>
        {orderText.cancelPayment}
      </Button>
    </div>
  );
};
