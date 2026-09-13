export const validationText = {
  emailRequired: 'Введите email.',
  emailTooLong: 'Email должен быть не длиннее 150 символов.',
  emailInvalid: 'Введите корректный email, например buyer@example.test.',
  nameInvalid: 'Введите имя: от 2 до 100 символов.',
  phoneInvalid: 'Введите номер целиком, например +7 999 000 00 00.',
  pickupRequired: 'Выберите пункт выдачи.',
  lengthRange: (min: number, max: number) => `Заполните поле: от ${min} до ${max} символов.`,
  apartmentTooLong: 'Не более 20 символов.',
} as const;

export const ADDRESS_VALIDATION_RULES = [
  { name: 'city', min: 2, max: 100 },
  { name: 'street', min: 2, max: 150 },
  { name: 'house', min: 1, max: 20 },
] as const;
