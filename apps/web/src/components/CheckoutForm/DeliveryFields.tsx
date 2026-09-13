import { useController, useFormContext } from 'react-hook-form';
import type { Draft } from '../../model/types';
import { checkout } from '../../model/checkout';
import { checkoutFormText, DELIVERY_HINTS } from '../../constants/checkout-form';
import style from '../../App.module.scss';
import { ChoiceOption, SelectField } from '../ui';
import { AddressFields } from '../AddressFields';

/** Управляет доставкой, сохраняя введённый адрес при переключении на самовывоз. */
export const DeliveryFields = () => {
  const { control } = useFormContext<Draft>();
  const { field: method } = useController({ control, name: 'method' });
  const { field: pickup, fieldState } = useController({ control, name: 'pickupPointId' });
  const options = checkout.state.options?.deliveryMethods ?? [];
  const points = options.find((option) => option.id === 'pickup')?.pickupPoints ?? [];

  const createMethodHandler = (value: Draft['method']) => () => method.onChange(value);

  return (
    <>
      <div className={style.choiceRow}>
        {options.map((option) => (
          <ChoiceOption
            key={option.id}
            name={method.name}
            value={option.id}
            checked={method.value === option.id}
            title={option.title}
            hint={DELIVERY_HINTS[option.id]}
            onChange={createMethodHandler(option.id)}
          />
        ))}
      </div>
      {method.value === 'pickup' ? (
        <SelectField
          {...pickup}
          label={checkoutFormText.pickupPoint}
          error={fieldState.error?.message}
        >
          {points.map((point) => (
            <option key={point.id} value={point.id}>
              {point.title}
              {checkoutFormText.pickupSeparator}
              {point.address}
            </option>
          ))}
        </SelectField>
      ) : (
        <AddressFields />
      )}
    </>
  );
};
