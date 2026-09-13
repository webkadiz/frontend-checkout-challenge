export const checkoutFormText = {
  contactsNumber: '01',
  contactsTitle: ' Контактные данные',
  contactsHint: 'Используйте тестовые контакты — заказ учебный.',
  name: 'Имя и фамилия',
  namePlaceholder: 'Иван Иванов',
  email: 'Email',
  emailPlaceholder: 'buyer@example.test',
  deliveryNumber: '02',
  deliveryTitle: ' Способ доставки',
  pickupHint: 'Заберите в удобном пункте',
  courierHint: 'Привезём по вашему адресу',
  pickupPoint: 'Пункт выдачи',
  pickupSeparator: ' — ',
  city: 'Город',
  street: 'Улица',
  cityPlaceholder: 'Москва',
  streetPlaceholder: 'Лесная',
  house: 'Дом',
  apartment: 'Квартира (необязательно)',
  housePlaceholder: '12, корпус 2',
  apartmentPlaceholder: '45',
  paymentNumber: '03',
  paymentTitle: ' Оплата',
  card: 'Картой онлайн',
  cash: 'При получении',
  cardHint: 'Тестовая платёжная форма',
  cashHint: 'Наличными',
  uncertain:
    'Предыдущий запрос мог создать заказ. Повтор проверит именно его; данные заказа сохранены.',
  submitting: 'Оформляем…',
  checkOrder: 'Проверить создание заказа',
  pay: 'Перейти к оплате',
  submit: 'Оформить заказ',
  calculateDelivery: 'Рассчитать доставку',
  disclaimer: 'Это демонстрационный магазин. Деньги не списываются.',
} as const;

export const phoneText = {
  label: 'Телефон',
  placeholder: '+7 999 000 00 00',
} as const;

export const ADDRESS_FIELD_ROWS = [
  {
    id: 'street-address',
    fields: [
      {
        name: 'city',
        label: checkoutFormText.city,
        placeholder: checkoutFormText.cityPlaceholder,
        minLength: 2,
        maxLength: 100,
      },
      {
        name: 'street',
        label: checkoutFormText.street,
        placeholder: checkoutFormText.streetPlaceholder,
        minLength: 2,
        maxLength: 150,
      },
    ],
  },
  {
    id: 'building',
    fields: [
      {
        name: 'house',
        label: checkoutFormText.house,
        placeholder: checkoutFormText.housePlaceholder,
        minLength: 1,
        maxLength: 20,
      },
      {
        name: 'apartment',
        label: checkoutFormText.apartment,
        placeholder: checkoutFormText.apartmentPlaceholder,
        minLength: 0,
        maxLength: 20,
      },
    ],
  },
] as const;

export const DELIVERY_HINTS = {
  pickup: checkoutFormText.pickupHint,
  courier: checkoutFormText.courierHint,
} as const;

export const PAYMENT_OPTIONS = {
  card: { title: checkoutFormText.card, hint: checkoutFormText.cardHint },
  cash_on_delivery: { title: checkoutFormText.cash, hint: checkoutFormText.cashHint },
} as const;
