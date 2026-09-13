import classNames from 'classnames';
import type { Sandbox } from '../../types';
import style from '../../App.module.scss';

/** Вариант тестовой карты для проверки оплаты. */
type PaymentCardOptionProps = {
  /** Тестовая карта и соответствующий сценарий. */
  card: Sandbox['cards'][number];
  /** Выбрана ли эта карта. */
  selected: boolean;
  /** Запрещено ли менять выбранную карту. */
  disabled: boolean;
  /** Передаёт сценарий выбранной тестовой карты. */
  onSelect: (scenario: string) => void;
};

/** Один доступный сценарий тестовой оплаты с номером карты. */
export const PaymentCardOption = ({
  card,
  selected,
  disabled,
  onSelect,
}: PaymentCardOptionProps) => {
  const handleChange = () => onSelect(card.scenario);

  return (
    <label className={classNames(style.testCard, { [style.active]: selected })}>
      <input
        type="radio"
        name="testCard"
        checked={selected}
        disabled={disabled}
        onChange={handleChange}
      />
      <span>
        <strong>{card.title}</strong>
        <small>{card.maskedNumber}</small>
      </span>
    </label>
  );
};
