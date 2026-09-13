import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PhoneField } from '../src/components/PhoneField';
import { initialDraft, validate } from '../src/model/form';

it.each(['+79990000000', '+12133734253', '+442079460018'])(
  'accepts a complete international phone number: %s',
  (phone) => {
    expect(
      validate({ ...initialDraft, customer: { ...initialDraft.customer, phone } }).phone,
    ).toBeUndefined();
  },
);

it.each(['', '+7', '+7999000000', '+799900000000', '+7 999 000 00 00'])(
  'rejects incomplete, overlong or non-canonical API values: %s',
  (phone) => {
    expect(
      validate({ ...initialDraft, customer: { ...initialDraft.customer, phone } }).phone,
    ).toBeDefined();
  },
);

it('formats restored phone values and keeps errors accessible', () => {
  const html = renderToStaticMarkup(
    <PhoneField value="+79990000000" error="Проверьте номер" onChange={() => {}} />,
  );

  expect(html).toContain('value="+7 999 000 00 00"');
  expect(html).toContain('autoComplete="tel"');
  expect(html).toContain('aria-invalid="true"');
  expect(html).toContain('aria-describedby=');
  expect(html).toContain('Проверьте номер');
});
