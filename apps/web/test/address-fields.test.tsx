// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import type { Draft } from '../src/model/types';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AddressFields } from '../src/components/AddressFields';
import { initialDraft } from '../src/model/form';
import { getMenuLinks } from '../src/constants/menu';

afterEach(cleanup);

function AddressForm({ draft = initialDraft }: { draft?: Draft }) {
  const form = useForm<Draft>({ defaultValues: draft });

  return (
    <FormProvider {...form}>
      <AddressFields />
    </FormProvider>
  );
}

it('renders address labels, examples and length limits from the field configuration', () => {
  render(<AddressForm />);
  const city = screen.getByRole('textbox', { name: 'Город' }) as HTMLInputElement;
  const street = screen.getByRole('textbox', { name: 'Улица' }) as HTMLInputElement;
  const house = screen.getByRole('textbox', { name: 'Дом' }) as HTMLInputElement;
  expect([city.placeholder, city.maxLength]).toEqual(['Москва', 100]);
  expect([street.placeholder, street.maxLength]).toEqual(['Лесная', 150]);
  expect([house.placeholder, house.maxLength]).toEqual(['12, корпус 2', 20]);
  expect(screen.getByPlaceholderText('45')).toBeDefined();
});

it('updates only the edited address field', () => {
  const address = { city: 'Москва', street: 'Лесная', house: '12', apartment: '45' };
  render(<AddressForm draft={{ ...initialDraft, address }} />);
  const street = screen.getByRole('textbox', { name: 'Улица' });
  fireEvent.change(street, { target: { value: 'Новая' } });
  expect((street as HTMLInputElement).value).toBe('Новая');
  expect((screen.getByRole('textbox', { name: 'Город' }) as HTMLInputElement).value).toBe('Москва');
  expect((screen.getByRole('textbox', { name: 'Дом' }) as HTMLInputElement).value).toBe('12');
});

it('builds menu links with the current cart quantity', () => {
  expect(getMenuLinks(3).map((link) => link.page)).toEqual(['catalog', 'checkout', 'orders']);
  expect(getMenuLinks(3)[1].note).toBe('3 шт. / Ваш выбор');
  expect(getMenuLinks(0)[1].note).toBe('0 шт. / Ваш выбор');
});
