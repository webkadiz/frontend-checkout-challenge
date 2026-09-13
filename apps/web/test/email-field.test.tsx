// @vitest-environment jsdom
import { useSyncExternalStore } from 'react';
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutForm } from '../src/components/CheckoutForm';
import { checkout } from '../src/model/checkout';
import { initialDraft } from '../src/model/form';

afterEach(() => {
  cleanup();
  checkout.close();
});

it('shows email errors after blur, keeps them on unrelated edits, and clears them after correction', async () => {
  checkout.set({
    draft: structuredClone(initialDraft),
    fields: {},
    busy: false,
    orderUncertain: false,
  });
  function Form() {
    useSyncExternalStore(checkout.subscribe, checkout.getSnapshot);

    return <CheckoutForm />;
  }
  render(<Form />);

  const user = userEvent.setup();
  const input = screen.getByRole('textbox', { name: 'Email' });

  expect(input.getAttribute('aria-invalid')).toBe('false');
  await user.type(input, 'buyer@.com');
  expect(input.getAttribute('aria-invalid')).toBe('false');
  await user.tab();
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(screen.getByText(/Введите корректный email/)).toBeDefined();
  await user.type(screen.getByRole('textbox', { name: 'Имя и фамилия' }), 'Иван');
  expect(input.getAttribute('aria-invalid')).toBe('true');
  await user.clear(input);
  expect(screen.getByText('Введите email.')).toBeDefined();
  await user.type(input, 'buyer@example.test');
  expect(input.getAttribute('aria-invalid')).toBe('false');
  expect(screen.queryByText(/Введите корректный email/)).toBeNull();
});
