// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createHashRouter } from 'react-router';
import {
  browserPage,
  browserOrderId,
  writeBrowserPage,
  listenToBrowserNavigation,
  connectShopRouter,
} from '../src/lib/navigation';
import { Checkout } from '../src/model/checkout';
import { api } from '../src/api';
import type { Cart } from '@checkout/contracts';

let model: Checkout;
let stop: () => void;
let router: ReturnType<typeof createHashRouter>;
let disconnect: () => void;

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  model = new Checkout();
  model.set({ ready: true });
  router = createHashRouter([{ path: '*' }]);
  disconnect = connectShopRouter(router);
  stop = listenToBrowserNavigation(model.restoreNavigation);
});

afterEach(() => {
  stop();
  model.close();
  disconnect();
  router.dispose();
});

function travel(direction: 'back' | 'forward') {
  return new Promise<void>((resolve) => {
    window.addEventListener('popstate', () => resolve(), { once: true });
    window.history[direction]();
  });
}

it('returns to the catalog on Back and to checkout on Forward without losing the draft', async () => {
  model.edit({
    ...model.state.draft,
    customer: { ...model.state.draft.customer, name: 'Тестовый Покупатель' },
  });
  model.navigate('checkout');
  expect(window.location.hash).toBe('#/checkout');
  await travel('back');
  expect(model.state.page).toBe('catalog');
  expect(window.location.hash).toBe('');
  await travel('forward');
  expect(model.state.page).toBe('checkout');
  expect(model.state.draft.customer.name).toBe('Тестовый Покупатель');
});

it('does not add duplicate entries when the current page is selected again', async () => {
  model.navigate('checkout');

  const length = window.history.length;

  model.navigate('checkout');
  expect(window.history.length).toBe(length);
  await travel('back');
  expect(model.state.page).toBe('catalog');
});

it('reads the current route from the router instead of a stale saved page', async () => {
  stop();
  localStorage.setItem('checkout.page', JSON.stringify('catalog'));
  await router.navigate('/checkout');
  expect(browserPage()).toBe('checkout');
  await router.navigate('/order');
  expect(browserPage()).toBe('order');
  await router.navigate('/unknown');
  expect(browserPage()).toBe('catalog');
});

it('normalizes an unavailable order route without adding a history entry', () => {
  window.history.replaceState(null, '', '/#/order');

  const length = window.history.length;

  window.dispatchEvent(new PopStateEvent('popstate'));
  expect(model.state.page).toBe('catalog');
  expect(window.location.hash).toBe('#/');
  expect(window.history.length).toBe(length);
});

it('removes the history listener on cleanup', () => {
  stop();
  window.history.replaceState(null, '', '/#/checkout');
  window.dispatchEvent(new PopStateEvent('popstate'));
  expect(model.state.page).toBe('catalog');
});

it('preserves specific order ids through Back and Forward', async () => {
  stop();

  const visited: (string | null)[] = [];

  stop = listenToBrowserNavigation((page, id) => {
    visited.push(page, id);
  });
  writeBrowserPage('orders', 'push');
  writeBrowserPage('order', 'push', 'first');
  writeBrowserPage('order', 'push', 'second');
  expect(browserOrderId()).toBe('second');
  await travel('back');
  expect(visited.slice(-2)).toEqual(['order', 'first']);
  await travel('back');
  expect(visited.slice(-2)).toEqual(['orders', null]);
  await travel('forward');
  expect(visited.slice(-2)).toEqual(['order', 'first']);
});

it.each([
  ['/#/checkout', 'checkout', '#/checkout'],
  ['/', 'catalog', ''],
  ['/#/order', 'catalog', '#/'],
  ['/#/orders', 'orders', '#/orders'],
  ['/#/orders/missing', 'orders', '#/orders'],
] as const)('restores the URL on boot: %s', async (url, page, hash) => {
  const cart: Cart = {
    id: 'cart',
    version: 0,
    items: [],
    quantity: 0,
    subtotal: 0,
    currency: 'RUB',
  };

  const reply = <T>(data: T) => Promise.resolve({ data, etag: null, status: 200, retryMs: 1000 });

  model.close();
  model = new Checkout({
    ...api,
    products: () => reply([]),
    cart: () => reply(cart),
    options: () => reply({ cart, deliveryMethods: [], paymentMethods: [] }),
    sandbox: () => reply({ settlementDelayMs: 1000, cards: [] }),
    orders: () => reply([]),
  });
  localStorage.setItem('checkout.token', JSON.stringify('test-token'));
  localStorage.setItem('checkout.page', JSON.stringify('order'));
  window.history.replaceState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));

  const length = window.history.length;

  await model.boot();
  expect(model.state.error).toBeNull();
  expect(model.state.ready).toBe(true);
  expect(model.state.page).toBe(page);
  expect(window.location.hash).toBe(hash);
  expect(window.history.length).toBe(length);
});

it('follows a manually changed hash through React Router', async () => {
  window.location.hash = '/checkout';
  await vi.waitFor(() => expect(model.state.page).toBe('checkout'));
  expect(browserPage()).toBe('checkout');
});

it('round trips encoded order IDs without losing special characters', async () => {
  stop();
  writeBrowserPage('order', 'push', 'order one/два');
  await vi.waitFor(() => expect(browserOrderId()).toBe('order one/два'));
});
