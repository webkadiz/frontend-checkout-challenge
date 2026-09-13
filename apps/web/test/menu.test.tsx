// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FullscreenMenu } from '../src/components/FullscreenMenu';
import style from '../src/components/FullscreenMenu/FullscreenMenu.module.scss';

const modalDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
const closeDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false })),
  );
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  // jsdom does not implement the browser's modal top layer or focus restoration.
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    },
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();

  for (const [name, descriptor] of [
    ['showModal', modalDescriptor],
    ['close', closeDescriptor],
  ] as const) {
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }

  document.body.style.overflow = '';
});

function setup(canNavigate = true) {
  const navigate = vi.fn();

  render(
    <FullscreenMenu page="catalog" quantity={2} canNavigate={canNavigate} onNavigate={navigate} />,
  );

  return {
    user: userEvent.setup(),
    navigate,
    trigger: screen.getByRole('button', { name: 'Открыть меню' }),
  };
}

function finishTransition() {
  const event = new Event('transitionend', { bubbles: true });

  Object.defineProperty(event, 'propertyName', { value: 'opacity' });
  fireEvent(screen.getByRole('dialog'), event);
}

it('opens a modal, locks scrolling and restores focus and scrolling on close', async () => {
  document.body.style.overflow = 'auto';

  const { user, trigger } = setup();

  await user.click(trigger);
  expect(screen.getByRole('dialog')).toBeDefined();
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(document.body.style.overflow).toBe('hidden');
  await user.click(screen.getByRole('button', { name: 'Закрыть меню' }));
  expect(screen.getByRole('dialog').classList.contains(style.isClosing)).toBe(true);
  expect(document.body.style.overflow).toBe('hidden');
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  finishTransition();
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.body.style.overflow).toBe('auto');
  expect(document.activeElement).toBe(trigger);
});

it('handles Escape via the native dialog cancel event', async () => {
  const { user, trigger } = setup();

  await user.click(trigger);
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
  finishTransition();
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it('navigates and closes, showing the current cart quantity', async () => {
  const { user, trigger, navigate } = setup();

  await user.click(trigger);
  await user.click(screen.getByRole('button', { name: /Корзина/ }));
  expect(navigate).not.toHaveBeenCalled();
  finishTransition();
  expect(navigate).toHaveBeenCalledWith('checkout');
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('updates navigation props without remounting the open dialog', async () => {
  const navigate = vi.fn();

  const view = render(
    <FullscreenMenu page="catalog" quantity={2} canNavigate onNavigate={navigate} />,
  );

  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: 'Открыть меню' }));

  const dialog = screen.getByRole('dialog');

  expect(screen.getByRole('button', { name: /Коллекция/ }).getAttribute('aria-current')).toBe(
    'page',
  );
  view.rerender(
    <FullscreenMenu page="order" quantity={5} canNavigate={false} onNavigate={navigate} />,
  );

  expect(screen.getByRole('dialog')).toBe(dialog);
  expect(screen.getByRole('button', { name: /Корзина/ }).textContent).toContain('5 шт.');
  expect(screen.getByRole('button', { name: /Мои заказы/ }).getAttribute('aria-current')).toBe(
    'page',
  );
  expect((screen.getByRole('button', { name: /Мои заказы/ }) as HTMLButtonElement).disabled).toBe(
    true,
  );
  expect(screen.getByRole('button', { name: /Коллекция/ }).hasAttribute('aria-current')).toBe(
    false,
  );
});

it('keeps the first destination while the menu is closing', async () => {
  const { user, trigger, navigate } = setup();

  await user.click(trigger);
  fireEvent.click(screen.getByRole('button', { name: /Корзина/ }));
  fireEvent.click(screen.getByRole('button', { name: /Мои заказы/ }));
  expect(navigate).not.toHaveBeenCalled();
  finishTransition();
  expect(navigate).toHaveBeenCalledExactlyOnceWith('checkout');
});

it('ignores transitions from nested menu components', async () => {
  const { user, trigger } = setup();

  await user.click(trigger);
  await user.click(screen.getByRole('button', { name: 'Закрыть меню' }));

  const event = new Event('transitionend', { bubbles: true });

  Object.defineProperty(event, 'propertyName', { value: 'opacity' });
  fireEvent(screen.getByRole('button', { name: /Корзина/ }), event);
  expect(screen.getByRole('dialog')).toBeDefined();
  finishTransition();
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('unmounting the open panel restores the original scroll mode', async () => {
  document.body.style.overflow = 'auto';

  const view = render(
    <FullscreenMenu page="catalog" quantity={0} canNavigate onNavigate={vi.fn()} />,
  );

  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: 'Открыть меню' }));
  view.unmount();
  expect(document.body.style.overflow).toBe('auto');
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('keeps navigation disabled while busy and always offers order history', async () => {
  const { user, trigger, navigate } = setup(false);

  await user.click(trigger);
  expect((screen.getByRole('button', { name: /Мои заказы/ }) as HTMLButtonElement).disabled).toBe(
    true,
  );

  const link = screen.getByRole('button', { name: /Корзина/ }) as HTMLButtonElement;

  expect(link.textContent).toContain('2 шт.');
  expect(link.disabled).toBe(true);
  await user.click(link);
  expect(navigate).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Закрыть меню' }));
  finishTransition();
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('closes immediately when reduced motion is enabled', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true })),
  );

  const { user, trigger } = setup();

  await user.click(trigger);
  await user.click(screen.getByRole('button', { name: 'Закрыть меню' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.body.style.overflow).toBe('');
});

it('falls back to a timer if the transition event does not arrive', async () => {
  vi.useFakeTimers();

  const { trigger } = setup();

  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть меню' }));
  expect(screen.getByRole('dialog')).toBeDefined();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(500);
  });
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.body.style.overflow).toBe('');
});
