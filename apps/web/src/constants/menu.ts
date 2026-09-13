import type { MenuLink } from './types';

export const menuText = {
  collection: 'Коллекция',
  collectionHint: 'Вещи для жизни',
  cart: 'Корзина',
  cartHint: (quantity: number) => `${quantity} шт. / Ваш выбор`,
  orders: 'Мои заказы',
  ordersHint: 'История покупок',
  open: 'Открыть меню',
  brand: 'форма',
  registered: '®',
  edition: 'ВЕЩИ ДЛЯ ЖИЗНИ / 2026',
  close: 'Закрыть меню',
  title: 'НЕМНОГО ХОРОШИХ ВЕЩЕЙ',
  navigation: 'Разделы магазина',
  numberPrefix: '0',
  storyTitle: 'Меньше лишнего.',
  storyEmphasis: 'Больше своего.',
  storyStart: 'Для дома, работы',
  storyEnd: 'и маленьких ежедневных ритуалов.',
  footer: 'Простые вещи. Хорошие дни.',
  disclaimer: 'Учебный магазин · Без реальных списаний',
} as const;

/** Собирает пункты меню с актуальным количеством товаров в корзине. */
export function getMenuLinks(quantity: number) {
  return [
    { page: 'catalog', title: menuText.collection, note: menuText.collectionHint },
    { page: 'checkout', title: menuText.cart, note: menuText.cartHint(quantity) },
    { page: 'orders', title: menuText.orders, note: menuText.ordersHint },
  ] satisfies MenuLink[];
}
