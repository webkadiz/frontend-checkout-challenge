// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field } from '../src/components/ui';
import { PhoneField } from '../src/components/PhoneField';

afterEach(cleanup);

it.each(['Имя и фамилия', 'Телефон'])(
  'keeps %s accessible without focusing it when its caption is clicked',
  async (name) => {
    render(
      name === 'Телефон' ? <PhoneField value="" onChange={() => {}} /> : <Field label={name} />,
    );

    const user = userEvent.setup();
    const input = screen.getByRole('textbox', { name });

    await user.click(screen.getByText(name));
    expect(document.activeElement).not.toBe(input);
    await user.tab();
    expect(document.activeElement).toBe(input);
    await user.click(screen.getByText(name));
    await user.click(input);
    expect(document.activeElement).toBe(input);
  },
);
