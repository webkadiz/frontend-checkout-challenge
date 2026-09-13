import type { PaymentPresentation } from './types';
import type { PaymentPhase } from '../model/types';

export const paymentCopy: Record<PaymentPhase, PaymentPresentation> = {
  loading: {
    title: 'Загружаем заказ…',
    description: 'Уточняем актуальный статус и данные оплаты.',
  },
  not_started: {
    title: 'Остался один шаг.',
    description: 'Оплатите заказ тестовой картой. Настоящие данные карты не нужны.',
  },
  choosing_card: {
    title: 'Остался один шаг.',
    description: 'Оплатите заказ тестовой картой. Настоящие данные карты не нужны.',
  },
  processing: {
    title: 'Проверяем оплату',
    description: 'Дождитесь подтверждения. Эту страницу можно перезагрузить.',
  },
  verifying_order: {
    title: 'Подтверждаем заказ',
    description: 'Платёж прошёл. Проверяем подтверждение заказа на сервере.',
  },
  paid: {
    title: 'Спасибо за заказ.',
    description: 'Оплата подтверждена. Ваши вещи скоро будут с вами.',
  },
  cash_confirmed: {
    title: 'Спасибо за заказ.',
    description: 'Заказ оформлен, оплата при получении',
  },
  failed: {
    title: 'Карта не прошла.',
    description: 'Банк отклонил тестовую оплату. Выберите другую карту в новой попытке.',
  },
  cancelled: {
    title: 'Оплата отменена.',
    description: 'Заказ сохранён. Его можно оплатить, когда будете готовы.',
  },
};
