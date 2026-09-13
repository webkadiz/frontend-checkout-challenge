import { checkoutFormText } from '../../constants/checkout-form';
import style from '../../App.module.scss';
import { FormPhone } from './FormPhone';
import { FormInput } from './FormInput';

/** Контакты покупателя с маской телефона и проверкой после первого выхода из поля. */
export const ContactFields = () => {
  return (
    <>
      <p className={style.sectionHint}>{checkoutFormText.contactsHint}</p>
      <FormInput
        name="customer.name"
        label={checkoutFormText.name}
        placeholder={checkoutFormText.namePlaceholder}
        autoComplete="name"
        maxLength={100}
      />
      <div className={style.fieldRow}>
        <FormInput
          name="customer.email"
          label={checkoutFormText.email}
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          placeholder={checkoutFormText.emailPlaceholder}
          maxLength={150}
        />
        <FormPhone />
      </div>
    </>
  );
};
