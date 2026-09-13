import { useController, useFormContext } from 'react-hook-form';
import type { Draft } from '../../model/types';
import { checkout } from '../../model/checkout';
import { PAYMENT_OPTIONS } from '../../constants/checkout-form';
import style from '../../App.module.scss';
import { ChoiceOption } from '../ui';

/** Подключает способ оплаты к общему черновику формы. */
export const PaymentFields = () => {
  const { control } = useFormContext<Draft>();
  const { field } = useController({ control, name: 'paymentMethod' });

  const createPaymentHandler = (value: Draft['paymentMethod']) => () => field.onChange(value);

  return (
    <div className={style.choiceRow}>
      {checkout.state.options?.paymentMethods.map((method) => (
        <ChoiceOption
          key={method.id}
          name={field.name}
          value={method.id}
          checked={field.value === method.id}
          title={PAYMENT_OPTIONS[method.id].title}
          hint={PAYMENT_OPTIONS[method.id].hint}
          onChange={createPaymentHandler(method.id)}
        />
      ))}
    </div>
  );
};
