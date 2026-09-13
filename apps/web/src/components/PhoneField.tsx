import { phoneText } from '../constants/checkout-form';
import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ChangeEventHandler, Ref } from 'react';
import { FieldFrame } from './ui';
import { useFieldAttributes } from '../hooks/useFieldAttributes';
import PhoneInput from 'react-phone-number-input/input';
import type { Value } from 'react-phone-number-input/input';

/** Значение и обработчики телефонного поля с маской. */
export type PhoneFieldProps = {
  /** Текущее значение телефонного поля. */
  value: string;
  /** Ошибка проверки номера, если она есть. */
  error?: string;
  /** Передаёт обновлённое значение телефона. */
  onChange: (value: string) => void;
  /** Сообщает форме о завершении взаимодействия с полем. */
  onBlur?: () => void;
  /** Ссылка на input для управления фокусом из формы. */
  inputRef?: Ref<HTMLInputElement>;
};

/**
 * Нормализует начальные 8 и 9 до форматирования номера, сохраняя позицию курсора.
 * Учитывает вставку, автозаполнение и мобильный ввод без событий клавиатуры.
 */
const DomesticPhoneInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'>>(
  ({ onChange, ...props }, ref) => {
    const handleDomesticChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      const input = event.currentTarget;
      const raw = input.value.trimStart();

      if (raw.startsWith('8') || raw.startsWith('9')) {
        const normalized = `+7${raw.startsWith('8') ? raw.slice(1) : raw}`;
        const offset = normalized.length - input.value.length;
        const start = input.selectionStart;
        const end = input.selectionEnd;

        input.value = normalized;

        if (start !== null && end !== null)
          input.setSelectionRange(Math.max(0, start + offset), Math.max(0, end + offset));
      }

      onChange?.(event);
    };

    return <input {...props} ref={ref} onChange={handleDomesticChange} />;
  },
);

/** Поле телефона с маской, нормализацией номера и доступным сообщением ошибки. */
export const PhoneField = ({ value, error, onChange, onBlur, inputRef }: PhoneFieldProps) => {
  const attributes = useFieldAttributes({ error });

  const handlePhoneChange = (phone?: Value) => onChange(phone ?? '');

  return (
    <FieldFrame id={attributes.id} label={phoneText.label} error={error}>
      <PhoneInput
        {...attributes}
        ref={inputRef}
        onBlur={onBlur}
        inputComponent={DomesticPhoneInput}
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        defaultCountry="RU"
        useNationalFormatForDefaultCountryValue={false}
        placeholder={phoneText.placeholder}
        value={value || undefined}
        onChange={handlePhoneChange}
      />
    </FieldFrame>
  );
};

DomesticPhoneInput.displayName = 'DomesticPhoneInput';
