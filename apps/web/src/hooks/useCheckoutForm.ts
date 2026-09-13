import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { checkout } from '../model/checkout';
import type { Draft } from '../model/types';
import { checkoutResolver } from '../model/form-resolver';
import { CHECKOUT_FIELD_PATHS } from '../constants/form-fields';

/** Управляет полями и проверкой формы, сохраняя черновик и серверные ошибки. */
export function useCheckoutForm() {
  const form = useForm<Draft>({
    defaultValues: checkout.state.draft,
    mode: 'onTouched',
    resolver: checkoutResolver,
    shouldUnregister: false,
  });

  const { subscribe, setError, getFieldState, clearErrors } = form;
  const serverFields = checkout.state.fields;

  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        // RHF меняет вложенные объекты: модели нужен независимый снимок для сравнения доставки.
        callback: ({ values }) => checkout.edit(structuredClone(values)),
      }),
    [subscribe],
  );

  useEffect(() => {
    for (const [name, path] of Object.entries(CHECKOUT_FIELD_PATHS)) {
      if (serverFields[name]) setError(path, { type: 'server', message: serverFields[name] });
      else if (getFieldState(path).error?.type === 'server') clearErrors(path);
    }
  }, [serverFields, setError, getFieldState, clearErrors]);

  /** Отправляет проверенный черновик через существующую модель заказов. */
  const submit = async (values: Draft) => {
    checkout.edit(structuredClone(values));
    await checkout.submit();
  };

  /** Восстанавливает неопределённый заказ с прежним телом и ключом запроса. */
  const recoverOrder = async () => {
    await checkout.submit();
  };

  return {
    form,
    onSubmit: form.handleSubmit(
      checkout.state.orderUncertain ? recoverOrder : submit,
      checkout.state.orderUncertain ? recoverOrder : undefined,
    ),
  };
}
