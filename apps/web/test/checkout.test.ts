import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { buildApp } from '../../api/dist/app.js';
import { Checkout } from '../src/model/checkout';
import { api } from '../src/api';
import { initialDraft, isPaid, validate } from '../src/model/form';
import { paymentPhase } from '../src/model/payment-state';
import { storage, injectAxios, deferred } from './harness';

let app: Awaited<ReturnType<typeof buildApp>>,
  model: Checkout,
  http: ReturnType<typeof injectAxios>,
  now: number;

beforeEach(async () => {
  storage();
  now = Date.now();
  app = await buildApp({ now: () => now, paymentDelayMs: 1200 });
  http = injectAxios(app);
  model = new Checkout();
  await model.boot();
});

afterEach(async () => {
  model.close();
  await app.close();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

async function prepare() {
  await model.updateItem('lamp-orbit', 1);
  model.navigate('checkout');
  model.edit({
    ...initialDraft,
    customer: { name: 'Тестовый Покупатель', email: 'buyer@example.test', phone: '+79990000000' },
  });
}

it('retry resumes payment polling after the confirmation GET fails without another simulation', async () => {
  await prepare();
  await model.submit();
  await model.startPayment();
  const orderId = model.state.order!.id;
  http.dropNext(`GET /api/orders/${orderId}`);
  await model.simulate('success');
  expect(model.state.error).not.toBeNull();
  expect(paymentPhase(model.state.order, model.state.payment)).toBe('processing');

  vi.useFakeTimers();
  model.retry();
  await vi.waitFor(() => expect(model.state.busy).toBe(false));
  now += 1500;
  await vi.advanceTimersByTimeAsync(2000);
  expect(paymentPhase(model.state.order, model.state.payment)).toBe('paid');
  expect(
    http.calls.filter((call) => call.method === 'POST' && call.path.endsWith('/simulations')),
  ).toHaveLength(1);
});

it('restores a pending payment as card selection without polling or another payment POST', async () => {
  await prepare();
  await model.submit();
  await model.startPayment();

  const id = model.state.payment!.id;

  model.close();
  model = new Checkout();
  await model.boot();
  expect(paymentPhase(model.state.order, model.state.payment)).toBe('choosing_card');

  const calls = http.calls.length;

  vi.useFakeTimers();
  await vi.advanceTimersByTimeAsync(5000);
  await model.startPayment();
  expect(
    http.calls.slice(calls).filter((call) => call.path.includes(id) || call.method === 'POST'),
  ).toHaveLength(0);
});

it('waits for the authoritative order after a successful payment, including on reload', async () => {
  await prepare();
  await model.submit();
  await model.startPayment();

  const unpaid = model.state.order!;

  await model.simulate('success');
  now += 1500;
  model.close();

  let reads = 0;

  model = new Checkout({
    ...api,
    order: async (...args) => {
      const reply = await api.order(...args);

      return ++reads <= 2 ? { ...reply, data: unpaid } : reply;
    },
  });
  vi.useFakeTimers();
  await model.boot();
  expect(paymentPhase(model.state.order, model.state.payment)).toBe('verifying_order');
  expect(isPaid(model.state.order!)).toBe(false);
  await vi.advanceTimersByTimeAsync(1000);
  expect(isPaid(model.state.order!)).toBe(false);
  await vi.advanceTimersByTimeAsync(1000);
  expect(paymentPhase(model.state.order, model.state.payment)).toBe('paid');

  const count = reads;

  await vi.advanceTimersByTimeAsync(5000);
  expect(reads).toBe(count);
});

it('marks the debounce period as recalculating without keeping an invalid quote', async () => {
  await prepare();
  await model.recalculate();
  expect(model.state.quote).not.toBeNull();
  model.edit({ ...model.state.draft, pickupPointId: 'point-north' });
  expect(model.state.quote).toBeNull();
  expect(model.state.quoting).toBe(true);
  model.navigate('catalog');
  expect(model.state.quoting).toBe(false);
});

it('invalid email blocks order creation before any order request', async () => {
  await prepare();
  model.edit({
    ...model.state.draft,
    customer: { ...model.state.draft.customer, email: 'buyer@.com' },
  });
  await model.submit();
  expect(model.state.fields.email).toBeDefined();
  expect(model.state.order).toBeNull();
  expect(
    http.calls.filter((call) => call.method === 'POST' && call.path === '/api/orders'),
  ).toHaveLength(0);
});

it.each([false, true])(
  'clears the targeted item loader after a request (failure: %s)',
  async (fail) => {
    const gate = deferred<void>();

    model.close();
    model = new Checkout({
      ...api,
      setItem: async (...args) => {
        await gate.promise;

        return api.setItem(...args);
      },
    });
    await model.boot();

    const updating = model.updateItem('lamp-orbit', 1);

    expect(model.state.pendingProductId).toBe('lamp-orbit');
    expect(model.state.busy).toBe(true);
    expect(model.state.cart!.quantity).toBe(0);
    await model.updateItem('mug-line', 1);
    expect(model.state.pendingProductId).toBe('lamp-orbit');

    if (fail) gate.reject(new Error('Request failed'));
    else gate.resolve();

    await updating;
    expect(model.state.pendingProductId).toBeNull();
    expect(model.state.busy).toBe(false);
    expect(model.state.cart!.quantity).toBe(fail ? 0 : 1);
    expect(!!model.state.error).toBe(fail);
  },
);

it('card order, decline, cancel and success reuse one order and verify server status', async () => {
  await prepare();
  await model.submit();
  expect(model.state.error).toBeNull();

  const orderId = model.state.order!.id;

  expect(model.state.cart!.items).toEqual([]);
  await model.startPayment();

  const first = model.state.payment!.id;

  await model.simulate('decline');
  expect(model.state.payment!.status).toBe('processing');
  now += 1300;
  await model.refreshOrder();
  expect(model.state.payment!.status).toBe('failed');
  expect(isPaid(model.state.order!)).toBe(false);
  await model.startPayment();
  expect(model.state.payment!.id).not.toBe(first);
  await model.simulate('cancel');
  now += 1300;
  await model.refreshOrder();
  expect(model.state.payment!.status).toBe('cancelled');
  await model.startPayment();
  await model.simulate('success');
  now += 1300;
  await model.refreshOrder();
  expect(isPaid(model.state.order!)).toBe(true);
  expect(model.state.order!.id).toBe(orderId);
  expect((await api.orders()).data).toHaveLength(1);
});

it('cash confirms an unpaid order without a payment', async () => {
  await prepare();
  model.edit({ ...model.state.draft, paymentMethod: 'cash_on_delivery' });
  await model.submit();
  expect(model.state.order).toMatchObject({ status: 'confirmed', paymentStatus: 'unpaid' });
  expect(
    http.calls.filter((c) => c.method === 'POST' && c.path.endsWith('/payments')),
  ).toHaveLength(0);
});

it('keeps multiple orders and restores the selected order with its own payment', async () => {
  await prepare();
  await model.submit();

  const first = model.state.order!;

  await model.startPayment();

  const firstPayment = model.state.payment!;

  await model.simulate('cancel');
  now += 1500;
  await prepare();
  model.edit({ ...model.state.draft, paymentMethod: 'cash_on_delivery' });
  await model.submit();

  const second = model.state.order!;

  expect(model.state.orders.map((order) => order.id)).toEqual([second.id, first.id]);
  await model.openOrder(first.id);
  expect(model.state.order?.id).toBe(first.id);
  expect(model.state.payment?.id).toBe(firstPayment.id);
  expect(model.state.simulation).toBe('cancel');
  await model.openOrder(second.id);
  expect(model.state.payment).toBeNull();
  expect(model.state.simulation).toBeNull();
  await model.openOrder(first.id);
  model.close();
  model = new Checkout();
  await model.boot();
  expect(model.state.orders).toHaveLength(2);
  expect(model.state.order?.id).toBe(first.id);
  expect(model.state.payment?.id).toBe(firstPayment.id);
  await model.refreshOrders();
  expect(model.state.orders.find((order) => order.id === first.id)?.paymentStatus).toBe(
    'cancelled',
  );
});

it('ignores a delayed detail response after selecting another order', async () => {
  await prepare();
  await model.submit();

  const first = model.state.order!;

  now += 1000;
  await prepare();
  await model.submit();

  const second = model.state.order!;
  const gate = deferred<Awaited<ReturnType<typeof api.order>>>();

  model.close();
  model = new Checkout({
    ...api,
    order: (id, signal) => (id === first.id ? gate.promise : api.order(id, signal)),
  });
  await model.boot();

  const slow = model.openOrder(first.id);

  expect(model.state.orderLoading).toBe(true);
  await model.openOrder(second.id);
  gate.resolve(await api.order(first.id));
  await slow;
  expect(model.state.order?.id).toBe(second.id);
  expect(model.state.orderLoading).toBe(false);
  expect(model.state.error).toBeNull();
});

it('reconciles an uncertain payment before paying another order', async () => {
  await prepare();
  await model.submit();

  const first = model.state.order!;

  http.dropNext(`POST /api/orders/${first.id}/payments`);
  await model.startPayment();
  expect(model.state.error?.uncertain).toBe(true);
  await prepare();
  await model.submit();

  const second = model.state.order!;

  await model.startPayment();
  expect(model.state.error).toBeNull();
  expect(model.state.payment?.orderId).toBe(second.id);
  expect((await api.payments(first.id)).data).toHaveLength(1);
  expect((await api.payments(second.id)).data).toHaveLength(1);
});

it('lost order response survives reload; retry uses exact body and key after cart clearing', async () => {
  await prepare();
  http.dropNext('POST /api/orders');
  await model.submit();
  expect(model.state.orderUncertain).toBe(true);

  const sent = http.calls.find((c) => c.path === '/api/orders' && c.method === 'POST')!;

  model.close();
  model = new Checkout();
  await model.boot();
  await model.submit();

  const attempts = http.calls.filter((c) => c.path === '/api/orders' && c.method === 'POST');

  expect(attempts).toHaveLength(2);
  expect(attempts[1].body).toEqual(sent.body);
  expect(attempts[1].headers['idempotency-key']).toBe(sent.headers['idempotency-key']);
  expect((await api.orders()).data).toHaveLength(1);
  expect(model.state.orderUncertain).toBe(false);
});

it('lost payment and simulation responses replay without duplicate attempts', async () => {
  await prepare();
  await model.submit();

  const path = `/api/orders/${model.state.order!.id}/payments`;

  http.dropNext(`POST ${path}`);
  await model.startPayment();
  await model.startPayment();

  const attempts = http.calls.filter((c) => c.path === path && c.method === 'POST');

  expect(attempts[0].headers['idempotency-key']).toBe(attempts[1].headers['idempotency-key']);

  const sim = `/api/payments/${model.state.payment!.id}/simulations`;

  http.dropNext(`POST ${sim}`);
  await model.simulate('success');
  await model.simulate('decline');
  expect(
    http.calls.filter((c) => c.path === sim && c.method === 'POST').map((c) => c.body),
  ).toEqual([{ scenario: 'success' }, { scenario: 'success' }]);
  expect((await api.payments(model.state.order!.id)).data).toHaveLength(1);
});

it('double submit makes one order', async () => {
  await prepare();
  await Promise.all([model.submit(), model.submit()]);
  expect((await api.orders()).data).toHaveLength(1);
});

it('reload resolves a lost payment creation before a fresh retry after failure', async () => {
  await prepare();
  await model.submit();
  http.dropNext(`POST /api/orders/${model.state.order!.id}/payments`);
  await model.startPayment();
  model.close();
  model = new Checkout();
  await model.boot();

  const first = model.state.payment!.id;

  await model.simulate('decline');
  now += 1300;
  await model.refreshOrder();
  await model.startPayment();
  expect(model.state.payment!.id).not.toBe(first);
  expect((await api.payments(model.state.order!.id)).data).toHaveLength(2);
});

it('cart version conflict refreshes totals while preserving contacts', async () => {
  await prepare();
  await api.setItem('mug-line', 1);
  await model.submit();
  expect(model.state.error?.code).toBe('CART_VERSION_CONFLICT');
  expect(model.state.draft.customer.name).toBe('Тестовый Покупатель');
  expect(model.state.cart!.quantity).toBe(2);
  await model.submit();
  expect(model.state.order!.total).toBe(338000);
});

it('expired quote refreshes and requires a new confirmation', async () => {
  await prepare();

  const actual = api.createOrder;
  let expired = false;

  const altered = {
    ...api,
    createOrder: async (...args: Parameters<typeof actual>) => {
      if (!expired) {
        now += 600001;
        expired = true;
      }

      return actual(...args);
    },
  };

  model.close();
  model = new Checkout(altered);
  await model.boot();
  await model.submit();
  expect(model.state.error?.code).toBe('QUOTE_EXPIRED');
  expect(model.state.order).toBeNull();
  await model.submit();
  expect(model.state.order).not.toBeNull();
});

it('restores processing payment and polls to authoritative order confirmation', async () => {
  await prepare();
  await model.submit();
  await model.startPayment();
  await model.simulate('success');
  model.close();
  model = new Checkout();
  await model.boot();
  expect(model.state.payment!.status).toBe('processing');
  now += 1300;
  await vi.waitFor(() => expect(isPaid(model.state.order!)).toBe(true), { timeout: 2500 });
});

it('stock, empty basket and invalid form cannot create an order', async () => {
  await model.updateItem('clock-dot', 1);
  expect(model.state.error?.code).toBe('INSUFFICIENT_STOCK');
  await model.updateItem('bag-day', 6);
  expect(model.state.error?.code).toBe('INSUFFICIENT_STOCK');
  await model.submit();
  expect(model.state.order).toBeNull();
  expect(validate(initialDraft)).toHaveProperty('email');
});

it('stale quote response does not overwrite a newer address', async () => {
  await prepare();

  const original = api.quote;
  const gate = deferred<Awaited<ReturnType<typeof original>>>();
  let intercepted = false;

  const altered = {
    ...api,
    quote: (...args: Parameters<typeof original>) => {
      if (!intercepted) {
        intercepted = true;

        return gate.promise;
      }

      return original(...args);
    },
  };

  model.close();
  model = new Checkout(altered);
  await model.boot();

  const first = model.recalculate();

  await vi.waitFor(() => expect(intercepted).toBe(true));
  // Mimic an independent cart refresh superseding the background quote.
  model.navigate('catalog');
  gate.resolve({ data: { id: 'old' }, etag: null, status: 201, retryMs: 1000 } as Awaited<
    ReturnType<typeof api.quote>
  >);
  await first;
  expect(model.state.quote).toBeNull();
});
