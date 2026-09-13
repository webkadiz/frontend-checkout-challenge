import { ArrowRight } from 'lucide-react';
import { FormProvider } from 'react-hook-form';
import { useSyncExternalStore } from 'react';
import style from '../../App.module.scss';
import { checkout } from '../../model/checkout';
import { useCheckoutForm } from '../../hooks/useCheckoutForm';
import { checkoutFormText } from '../../constants/checkout-form';
import { Alert, FormSection, Button, LoadingIndicator } from '../ui';
import { ContactFields } from './ContactFields';
import { DeliveryFields } from './DeliveryFields';
import { PaymentFields } from './PaymentFields';

/** Собирает секции оформления и передаёт управление полями React Hook Form. */
export const CheckoutForm = () => {
  const { draft, busy, orderUncertain, cart, quoting, quote } = useSyncExternalStore(
    checkout.subscribe,
    checkout.getSnapshot,
  );

  const { form, onSubmit } = useCheckoutForm();
  const fieldsDisabled = busy || orderUncertain;

  const submitLabel = orderUncertain
    ? checkoutFormText.checkOrder
    : draft.paymentMethod === 'card'
      ? checkoutFormText.pay
      : checkoutFormText.submit;

  const handleRecalculate = () => void checkout.recalculate();

  return (
    <FormProvider {...form}>
      <form className={style.checkoutForm} noValidate onSubmit={onSubmit}>
        <FormSection
          step={checkoutFormText.contactsNumber}
          title={checkoutFormText.contactsTitle}
          disabled={fieldsDisabled}
        >
          <ContactFields />
        </FormSection>
        <FormSection
          step={checkoutFormText.deliveryNumber}
          title={checkoutFormText.deliveryTitle}
          disabled={fieldsDisabled}
        >
          <DeliveryFields />
        </FormSection>
        <FormSection
          step={checkoutFormText.paymentNumber}
          title={checkoutFormText.paymentTitle}
          disabled={fieldsDisabled}
        >
          <PaymentFields />
        </FormSection>
        {orderUncertain && <Alert>{checkoutFormText.uncertain}</Alert>}
        <Button
          variant="primary"
          fullWidth
          type="submit"
          aria-busy={busy}
          disabled={busy || (!cart?.items.length && !orderUncertain)}
        >
          {busy ? (
            <LoadingIndicator label={checkoutFormText.submitting} />
          ) : (
            <>
              {submitLabel} <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </Button>
        {!quote && !quoting && !orderUncertain && (
          <Button type="button" variant="text" disabled={busy} onClick={handleRecalculate}>
            {checkoutFormText.calculateDelivery}
          </Button>
        )}
        <p className={style.finePrint}>{checkoutFormText.disclaimer}</p>
      </form>
    </FormProvider>
  );
};
