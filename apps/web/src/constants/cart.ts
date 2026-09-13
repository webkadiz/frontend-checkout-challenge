export const cartText = {
  title: 'Ваш заказ',
  quantitySuffix: ' шт.',
  removeLabel: 'Удалить: ',
  remove: 'Удалить',
  products: 'Товары',
  delivery: 'Доставка',
  free: 'Бесплатно',
  calculating: 'Рассчитываем',
  chooseAddress: 'После выбора адреса',
  total: 'Итого',
  updating: 'Обновляем стоимость…',
  subtotalHint: 'Пока без учёта доставки',
  confirmation: 'Итоговая стоимость подтверждается при оформлении.',
} as const;

export const quantityText = {
  label: (title: string) => `Количество: ${title}`,
  decrease: (title: string) => `Уменьшить количество: ${title}`,
  increase: (title: string) => `Увеличить количество: ${title}`,
} as const;
