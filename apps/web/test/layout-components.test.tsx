// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SiteFeedback } from '../src/components/SiteFeedback';
import { FormSection } from '../src/components/ui';
import { ApiError } from '../src/lib/http';

afterEach(cleanup);

it('does not render feedback when there is no error', () => {
  const { container } = render(
    <SiteFeedback error={null} onRetry={vi.fn()} onNewSession={vi.fn()} />,
  );

  expect(container.childElementCount).toBe(0);
});

it('offers session recovery only for an authentication error', () => {
  const onNewSession = vi.fn();
  const onRetry = vi.fn();

  const { rerender } = render(
    <SiteFeedback
      error={new ApiError('Session expired', 'UNAUTHORIZED', 401)}
      onRetry={onRetry}
      onNewSession={onNewSession}
    />,
  );

  expect(screen.getAllByRole('alert')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Начать новую гостевую сессию' }));
  expect(onNewSession).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
  expect(onRetry).toHaveBeenCalledOnce();

  rerender(
    <SiteFeedback
      error={new ApiError('Server unavailable', 'UNAVAILABLE', 503)}
      onRetry={onRetry}
      onNewSession={onNewSession}
    />,
  );

  expect(screen.getAllByRole('alert')).toHaveLength(1);
  expect(screen.queryByRole('button', { name: 'Начать новую гостевую сессию' })).toBeNull();
});

it('preserves the section legend and native disabling of all nested fields', () => {
  const section = (disabled: boolean) => (
    <FormSection step="01" title=" Contacts" disabled={disabled}>
      <input aria-label="Name" />
      <select aria-label="Delivery">
        <option>Pickup</option>
      </select>
    </FormSection>
  );

  const { rerender } = render(section(true));

  expect(screen.getByRole('group', { name: '01 Contacts' }).tagName).toBe('FIELDSET');
  expect(screen.getByRole('textbox', { name: 'Name' }).matches(':disabled')).toBe(true);
  expect(screen.getByRole('combobox', { name: 'Delivery' }).matches(':disabled')).toBe(true);

  rerender(section(false));

  expect(screen.getByRole('textbox', { name: 'Name' }).matches(':disabled')).toBe(false);
  expect(screen.getByRole('combobox', { name: 'Delivery' }).matches(':disabled')).toBe(false);
});
