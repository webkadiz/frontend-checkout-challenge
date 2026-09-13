// @vitest-environment jsdom
import { useSyncExternalStore } from 'react';
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhoneField } from '../src/components/PhoneField';
import { Checkout } from '../src/model/checkout';

afterEach(cleanup);

function setup() {
  localStorage.clear();

  const model = new Checkout();

  function Form() {
    const { draft } = useSyncExternalStore(model.subscribe, model.getSnapshot);

    return (
      <PhoneField
        value={draft.customer.phone}
        onChange={(phone) =>
          model.edit({
            ...draft,
            customer: { ...draft.customer, phone },
          })
        }
      />
    );
  }
  render(<Form />);

  return {
    model,
    input: screen.getByRole('textbox', { name: 'Телефон' }) as HTMLInputElement,
    user: userEvent.setup(),
  };
}

it('formats typing and clearing while persisting canonical values', async () => {
  const { model, input, user } = setup();

  await user.type(input, '+79991234567');
  expect(input.value).toBe('+7 999 123 45 67');
  expect(model.state.draft.customer.phone).toBe('+79991234567');
  await user.clear(input);
  expect(input.value).toBe('');
  expect(model.state.draft.customer.phone).toBe('');
});

it.each([
  ['8', '+7', '+7', '9991234567'],
  ['9', '+7 9', '+79', '991234567'],
])('recognizes the first digit %s immediately', async (first, formatted, canonical, rest) => {
  const { model, input, user } = setup();

  await user.type(input, first);
  expect(input.value).toBe(formatted);
  expect(model.state.draft.customer.phone).toBe(canonical);
  await user.type(input, rest);
  expect(input.value).toBe('+7 999 123 45 67');
  expect(model.state.draft.customer.phone).toBe('+79991234567');
  await user.clear(input);
  expect(input.value).toBe('');
  expect(model.state.draft.customer.phone).toBe('');
});

it.each([
  ['8 (999) 123-45-67', '+79991234567'],
  ['9991234567', '+79991234567'],
  ['+1 (213) 373-4253', '+12133734253'],
])('normalizes a pasted number: %s', async (text, canonical) => {
  const { model, input, user } = setup();

  await user.click(input);
  await user.paste(text);
  expect(model.state.draft.customer.phone).toBe(canonical);

  if (canonical.startsWith('+7')) expect(input.value).toBe('+7 999 123 45 67');
});

it('replaces a digit in the middle and handles backspace', async () => {
  const { model, input, user } = setup();

  await user.type(input, '+79991234567');
  input.setSelectionRange(7, 8);
  await user.keyboard('5');
  expect(input.value).toBe('+7 999 523 45 67');
  expect(model.state.draft.customer.phone).toBe('+79995234567');
  await user.keyboard('{End}{Backspace}');
  expect(model.state.draft.customer.phone).toBe('+7999523456');
});

it.each(['8', '9'])('handles input events without keydown, as on mobile: %s', (first) => {
  const { model, input } = setup();

  fireEvent.input(input, { target: { value: first } });
  expect(input.value).toBe(first === '8' ? '+7' : '+7 9');
  expect(model.state.draft.customer.phone).toBe(first === '8' ? '+7' : '+79');
});

it('normalizes a domestic number when replacing all of an existing number', async () => {
  const { model, input, user } = setup();

  await user.type(input, '+12133734253');
  input.setSelectionRange(0, input.value.length);
  await user.paste('8 (999) 123-45-67');
  expect(input.value).toBe('+7 999 123 45 67');
  expect(model.state.draft.customer.phone).toBe('+79991234567');
});
