import type { Page } from '../lib/types';

/** Описание ссылки на раздел магазина. */
export type MenuLink = {
  /** Раздел, в который ведёт ссылка. */
  page: Page;
  /** Название раздела в меню. */
  title: string;
  /** Краткое пояснение под названием раздела. */
  note: string;
};

/** Тексты, поясняющие текущее состояние оплаты. */
export type PaymentPresentation = {
  /** Заголовок состояния. */
  title: string;
  /** Пояснение и доступные дальнейшие действия. */
  description: string;
};
