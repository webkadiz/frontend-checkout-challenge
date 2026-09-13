// @vitest-environment jsdom
import { createRef } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChoiceOption, Field, FormSection, SelectField } from '../src/components/ui';

afterEach(cleanup);

it('preserves input id, ref and external description while adding and clearing an error', () => {
  const ref = createRef<HTMLInputElement>();

  const view = render(
    <>
      <p id="hint">Hint</p>
      <Field id="email" ref={ref} label="Email" error="Invalid" aria-describedby="hint" />
    </>,
  );

  const input = screen.getByRole('textbox', { name: 'Email' });

  expect(input.id).toBe('email');
  expect(ref.current).toBe(input);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.getAttribute('aria-describedby')).toBe('hint email-error');
  expect(document.getElementById('email-error')?.textContent).toBe('Invalid');
  view.rerender(
    <>
      <p id="hint">Hint</p>
      <Field id="email" ref={ref} label="Email" aria-describedby="hint" />
    </>,
  );
  expect(input.getAttribute('aria-invalid')).toBe('false');
  expect(input.getAttribute('aria-describedby')).toBe('hint');
  expect(document.getElementById('email-error')).toBeNull();
});

it('generates independent stable ids for fields', () => {
  const view = render(
    <>
      <Field label="First" />
      <Field label="Second" />
    </>,
  );

  const first = screen.getByRole('textbox', { name: 'First' });
  const second = screen.getByRole('textbox', { name: 'Second' });
  const firstId = first.id;

  expect(firstId).not.toBe(second.id);
  view.rerender(
    <>
      <Field label="First" error="Required" />
      <Field label="Second" />
    </>,
  );
  expect(first.id).toBe(firstId);
  expect(first.getAttribute('aria-describedby')).toBe(`${firstId}-error`);
  expect(second.hasAttribute('aria-describedby')).toBe(false);
});

it('shares select-field accessibility without label click focusing and forwards value changes', async () => {
  const ref = createRef<HTMLSelectElement>();
  const change = vi.fn();

  render(
    <SelectField label="Pickup" error="Choose" ref={ref} defaultValue="" onChange={change}>
      <option value="">Choose point</option>
      <option value="one">First point</option>
    </SelectField>,
  );

  const user = userEvent.setup();
  const select = screen.getByRole('combobox', { name: 'Pickup' });

  expect(ref.current).toBe(select);
  expect(select.getAttribute('aria-invalid')).toBe('true');
  expect(document.getElementById(select.getAttribute('aria-describedby')!)?.textContent).toBe(
    'Choose',
  );
  await user.click(screen.getByText('Pickup'));
  expect(document.activeElement).not.toBe(select);
  await user.tab();
  expect(document.activeElement).toBe(select);
  await user.selectOptions(select, 'one');
  expect(ref.current?.value).toBe('one');
  expect(change).toHaveBeenCalledTimes(1);
});

it('disables all controls through the fieldset and allows a section without a step number', async () => {
  const change = vi.fn();

  render(
    <FormSection title="Delivery" disabled>
      <Field label="Address" />
      <ChoiceOption title="Pickup" name="delivery" value="pickup" onChange={change} />
    </FormSection>,
  );

  const user = userEvent.setup();

  await user.click(screen.getByRole('radio', { name: 'Pickup' }));
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox', { name: 'Address' }).matches(':disabled')).toBe(true);
  expect(screen.getByRole('group', { name: 'Delivery' }).querySelector('legend span')).toBeNull();
});

it('forwards radio ref and native attributes and handles selection through its caption', async () => {
  const ref = createRef<HTMLInputElement>();
  const change = vi.fn();

  render(
    <ChoiceOption
      ref={ref}
      title="Courier"
      hint="Tomorrow"
      name="delivery"
      value="courier"
      required
      onChange={change}
    />,
  );

  const user = userEvent.setup();

  await user.click(screen.getByText('Courier'));
  expect(ref.current?.checked).toBe(true);
  expect(ref.current?.required).toBe(true);
  expect(ref.current?.value).toBe('courier');
  expect(change).toHaveBeenCalledTimes(1);
});
