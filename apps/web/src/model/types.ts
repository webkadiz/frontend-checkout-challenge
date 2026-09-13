import type {
  Cart,
  Product,
  Quote,
  Order,
  Payment,
  Scenario,
  Customer,
  CreateOrder,
} from '@checkout/contracts';
import type { Options, Sandbox } from '../types';
import type { ApiError } from '../lib/http';
import type { Page } from '../lib/types';

/** Текущее состояние каталога, оформления, заказов и оплаты. */
export type CheckoutState = {
  /** Завершена ли начальная загрузка магазина. */
  ready: boolean;
  /** Выполняется ли операция, блокирующая действия пользователя. */
  busy: boolean;
  /** Идентификатор товара с ожидающим изменением количества. */
  pendingProductId: string | null;
  /** Общая ошибка магазина; null при её отсутствии. */
  error: ApiError | null;
  /** Загруженный каталог товаров. */
  products: Product[];
  /** Корзина текущей сессии; null до загрузки. */
  cart: Cart | null;
  /** Справочники доставки и оплаты; null до загрузки. */
  options: Options | null;
  /** Настройки тестовой оплаты; null до загрузки. */
  sandbox: Sandbox | null;
  /** Последний расчёт стоимости заказа; null при его отсутствии. */
  quote: Quote | null;
  /** Выполняется ли пересчёт заказа. */
  quoting: boolean;
  /** Черновик контактных данных, доставки и оплаты. */
  draft: Draft;
  /** Сообщения проверки по путям полей формы. */
  fields: Record<string, string>;
  /** Открытый заказ; null, если он ещё не загружен. */
  order: Order | null;
  /** Загруженная история заказов текущей сессии. */
  orders: Order[];
  /** Загружается ли открытый заказ. */
  orderLoading: boolean;
  /** Загружается ли история заказов. */
  ordersLoading: boolean;
  /** Текущая попытка оплаты; null до её создания или загрузки. */
  payment: Payment | null;
  /** Текущий раздел магазина. */
  page: Page;
  /** Есть ли попытка создания заказа с неподтверждённым результатом. */
  orderUncertain: boolean;
  /** Сценарий неподтверждённой симуляции оплаты для повтора. */
  simulation: Scenario | null;
};

/** Тело запроса на создание попытки оплаты. */
export type PaymentAttemptBody = {
  /** Идентификатор оплачиваемого заказа. */
  orderId: string;
};

/** Сохраняемый черновик формы оформления заказа. */
export type Draft = {
  /** Контактные данные покупателя. */
  customer: Customer;
  /** Выбранный способ доставки. */
  method: 'pickup' | 'courier';
  /** Идентификатор выбранного пункта самовывоза. */
  pickupPointId: string;
  /** Адрес для курьерской доставки. */
  address: DeliveryAddress;
  /** Выбранный способ оплаты заказа. */
  paymentMethod: CreateOrder['paymentMethod'];
};

/** Адрес курьерской доставки из формы оформления. */
export type DeliveryAddress = {
  /** Город доставки. */
  city: string;
  /** Название улицы. */
  street: string;
  /** Номер дома с корпусом, если он указан. */
  house: string;
  /** Квартира; пустая строка, если она не указана. */
  apartment: string;
};

/** Статусы заказа и оплаты для проверки завершения покупки. */
export type OrderPaymentState = {
  /** Текущий статус заказа. */
  status: string;
  /** Текущий статус оплаты заказа. */
  paymentStatus: string;
};

/** Состояния интерфейса оплаты от загрузки заказа до завершения. */
export type PaymentPhase =
  | 'loading'
  | 'not_started'
  | 'choosing_card'
  | 'processing'
  | 'verifying_order'
  | 'paid'
  | 'cash_confirmed'
  | 'failed'
  | 'cancelled';
