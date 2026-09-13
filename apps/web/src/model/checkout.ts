import type { CheckoutState, PaymentAttemptBody, Draft } from './types';
import { checkoutErrorText } from '../constants/errors';
import type { Quote, Order, CreateOrder, Scenario } from '@checkout/contracts';
import { api } from '../api';
import type { CheckoutApi } from '../types';
import { ApiError, asError } from '../lib/http';
import { Observable, poll } from '../lib/async';
import { attempt, readStorage, saveStorage } from '../lib/storage';
import type { Attempt, HistoryMode, Page } from '../lib/types';
import { deliveryOf, initialDraft, validate } from './form';
import { canStartPayment, paymentComplete, paymentPhase } from './payment-state';
import { browserPage, browserOrderId, writeBrowserPage } from '../lib/navigation';

/** Управляет корзиной, оформлением и восстановлением заказов и оплаты. */
export class Checkout extends Observable<CheckoutState> {
  private quoteTimer?: ReturnType<typeof setTimeout>;
  private quoteController?: AbortController;
  private monitor?: AbortController;
  private epoch = 0;
  private orderController?: AbortController;
  private ordersController?: AbortController;
  private lastAction: (() => Promise<void>) | null = null;

  /** Создаёт состояние магазина и поднимает сохранённый черновик формы. */
  constructor(private client: CheckoutApi = api) {
    super({
      ready: false,
      busy: false,
      pendingProductId: null,
      error: null,
      products: [],
      cart: null,
      options: null,
      sandbox: null,
      quote: null,
      quoting: false,
      draft: readStorage('checkout.draft', initialDraft),
      fields: {},
      order: null,
      orders: [],
      orderLoading: false,
      ordersLoading: false,
      payment: null,
      page: 'catalog',
      orderUncertain: !!readStorage('checkout.orderAttempt', null),
      simulation: null,
    });
  }

  /** Не допускает параллельных действий и сохраняет операцию для явного повтора. */
  run = async (action: () => Promise<void>) => {
    if (this.state.busy) return;

    this.lastAction = action;
    this.set({ busy: true, error: null });

    try {
      await action();
    } catch (error) {
      this.set({ error: asError(error) });
    } finally {
      this.set({ busy: false });
    }
  };

  /** Повторяет последнее действие с исходными параметрами. */
  retry = () => {
    if (this.lastAction) void this.run(this.lastAction);
  };

  /** Восстанавливает сессию, заказ и неопределённые операции, затем возобновляет опрос. */
  boot = () =>
    this.run(async () => {
      if (!readStorage('checkout.token', null)) {
        const session = (await this.client.session()).data;

        saveStorage('checkout.token', session.token);
      }

      const [products, cart, options, sandbox, orders] = await Promise.all([
        this.client.products(),
        this.client.cart(),
        this.client.options(),
        this.client.sandbox(),
        this.client.orders(),
      ]);

      const savedId = readStorage<string | null>('checkout.order', null);
      const routeId = browserOrderId();

      const order = routeId
        ? (orders.data.find((o) => o.id === routeId) ?? null)
        : (orders.data.find((o) => o.id === savedId) ?? orders.data[0] ?? null);

      const unresolvedOrder = !!readStorage('checkout.orderAttempt', null);

      const pendingPayment = readStorage<Attempt<PaymentAttemptBody> | null>(
        'checkout.paymentAttempt',
        null,
      );

      if (pendingPayment) {
        // Уточняем результат создания заказа перед новой попыткой оплаты.
        await this.client.createPayment(pendingPayment.body.orderId, pendingPayment.key);
        saveStorage('checkout.paymentAttempt', null);
      }

      const payment = order ? ((await this.client.payments(order.id)).data[0] ?? null) : null;
      // Список мог загрузиться до завершения оплаты: проверяем выбранный заказ отдельно.
      const confirmedOrder = order ? (await this.client.order(order.id)).data : null;

      const simulation = payment
        ? readStorage<Scenario | null>(`checkout.simulation.${payment.id}`, null)
        : null;

      const requestedPage = unresolvedOrder
        ? 'checkout'
        : (browserPage() ?? readStorage<Page>('checkout.page', order ? 'order' : 'catalog'));

      const page =
        requestedPage === 'order' && !order ? (routeId ? 'orders' : 'catalog') : requestedPage;

      this.set({
        ready: true,
        products: products.data,
        cart: cart.data,
        options: options.data,
        sandbox: sandbox.data,
        order: confirmedOrder,
        orders: this.sortedOrders(
          orders.data.map((item) => (item.id === confirmedOrder?.id ? confirmedOrder : item)),
        ),
        payment,
        page,
        simulation,
        orderUncertain: unresolvedOrder,
      });
      writeBrowserPage(page, 'replace', order?.id);
      this.scheduleQuote();
      this.watch();
    });

  /** Создаёт новую гостевую сессию, очищая привязки к прежним заказам и попыткам. */
  newSession = () =>
    this.run(async () => {
      this.close();

      for (const key of ['token', 'order', 'orderAttempt', 'paymentAttempt', 'page'])
        saveStorage(`checkout.${key}`, null);

      this.set({
        ready: false,
        order: null,
        orders: [],
        payment: null,
        quote: null,
        orderUncertain: false,
      });

      const session = (await this.client.session()).data;

      saveStorage('checkout.token', session.token);
    }).then(() => {
      if (!this.state.error) void this.boot();
    });

  /** Меняет экран и маршрут, отменяя запросы предыдущего экрана. */
  navigate = (page: Page, historyMode: HistoryMode = 'push') => {
    if (page === 'order' && !this.state.order) page = 'catalog';

    this.monitor?.abort();
    this.orderController?.abort();
    this.ordersController?.abort();
    saveStorage('checkout.page', page);
    this.set({ page, error: null, orderLoading: false, ordersLoading: false });
    writeBrowserPage(page, historyMode, this.state.order?.id);
    this.scheduleQuote();
    this.watch();
  };

  /** Восстанавливает экран и нужный заказ при навигации браузера. */
  restoreNavigation = (page: Page, orderId: string | null) => {
    if (!this.state.ready) return;

    if (page === this.state.page && (page !== 'order' || orderId === this.state.order?.id)) return;

    if (page === 'order' && orderId) void this.openOrder(orderId, 'replace');
    else this.navigate(page, 'replace');
  };

  /** Возвращает копию списка заказов от новых к старым. */
  private sortedOrders(orders: Order[]) {
    return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /** Обновляет заказ в истории без дубликатов и сохраняет порядок по дате. */
  private rememberOrder(order: Order) {
    return this.sortedOrders([order, ...this.state.orders.filter((item) => item.id !== order.id)]);
  }

  /** Перечитывает историю, игнорируя ответ отменённого запроса. */
  refreshOrders = async () => {
    this.ordersController?.abort();

    const controller = new AbortController();

    this.ordersController = controller;
    this.set({ ordersLoading: true, error: null });

    try {
      const orders = (await this.client.orders()).data;

      if (!controller.signal.aborted) this.set({ orders: this.sortedOrders(orders) });
    } catch (error) {
      if (!controller.signal.aborted) {
        this.lastAction = this.refreshOrders;
        this.set({ error: asError(error) });
      }
    } finally {
      if (this.ordersController === controller) this.set({ ordersLoading: false });
    }
  };

  /** Загружает выбранный заказ, защищая экран от запоздавших ответов. */
  openOrder = async (id: string, historyMode: HistoryMode = 'push') => {
    // Не меняем оплачиваемый заказ, пока выполняется запрос на изменение данных.
    if (this.state.busy) {
      writeBrowserPage(this.state.page, 'replace', this.state.order?.id);

      return;
    }

    const order = this.state.orders.find((item) => item.id === id);

    if (!order) {
      this.navigate('orders', 'replace');

      return;
    }

    try {
      saveStorage('checkout.order', id);
    } catch (error) {
      this.set({ error: asError(error) });

      return;
    }

    this.set({ order, payment: null, simulation: null });
    this.navigate('order', historyMode);

    const controller = new AbortController();

    this.orderController = controller;
    this.set({ orderLoading: true });

    try {
      await this.loadOrder(controller.signal);

      if (!controller.signal.aborted) {
        this.set({ orderLoading: false });
        this.watch();
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        this.lastAction = async () => {
          await this.loadOrder();
          this.watch();
        };
        this.set({ error: asError(error) });
      }
    } finally {
      if (this.orderController === controller) this.set({ orderLoading: false });
    }
  };

  /** Сохраняет черновик и запрашивает новый расчёт только при смене доставки. */
  edit = (draft: Draft) => {
    if (this.state.orderUncertain || this.state.busy) return;

    const changedDelivery =
      JSON.stringify(deliveryOf(draft)) !== JSON.stringify(deliveryOf(this.state.draft));

    try {
      saveStorage('checkout.draft', draft);
      this.set({ draft, fields: {} });

      if (changedDelivery) this.scheduleQuote();
    } catch (error) {
      this.set({ error: asError(error) });
    }
  };

  /** Изменяет серверную корзину и планирует пересчёт итоговой суммы. */
  updateItem = (id: string, quantity: number) =>
    this.run(async () => {
      this.set({ pendingProductId: id });

      try {
        this.invalidateQuote();

        if (quantity === 0) await this.client.deleteItem(id);
        else await this.client.setItem(id, quantity);

        this.set({ cart: (await this.client.cart()).data });
        this.scheduleQuote();
      } finally {
        this.set({ pendingProductId: null });
      }
    });

  /** Отменяет предыдущий расчёт и делает его запоздавший ответ неактуальным. */
  private invalidateQuote() {
    clearTimeout(this.quoteTimer);
    this.quoteController?.abort();
    this.epoch++;
    this.set({ quote: null, quoting: false });
  }

  /** Откладывает расчёт на 400 мс, пока доставка и корзина готовы к запросу. */
  private scheduleQuote() {
    this.invalidateQuote();

    if (
      this.state.page !== 'checkout' ||
      !this.state.cart?.items.length ||
      Object.keys(validate(this.state.draft, false)).length ||
      this.state.orderUncertain
    )
      return;

    this.set({ quoting: true });
    this.quoteTimer = setTimeout(() => {
      void this.refreshQuote().catch((error) => {
        if (asError(error).code !== 'ABORTED') {
          this.lastAction = async () => {
            this.set({ cart: (await this.client.cart()).data });
            await this.refreshQuote();
          };
          this.set({ error: asError(error) });
        }
      });
    }, 400);
  }

  /** Получает серверный итог для текущей версии корзины, отсеивая старые ответы. */
  private async refreshQuote(): Promise<Quote | null> {
    this.invalidateQuote();

    const version = this.state.cart?.version;

    if (version === undefined) return null;

    const revision = this.epoch;
    const controller = new AbortController();

    this.quoteController = controller;
    this.set({ quoting: true });

    try {
      const reply = await this.client.quote(
        version,
        deliveryOf(this.state.draft),
        controller.signal,
      );

      if (revision !== this.epoch) return null;

      this.set({ quote: reply.data });

      return reply.data;
    } catch (error) {
      if (controller.signal.aborted || revision !== this.epoch) return null;

      if (asError(error).code === 'CART_VERSION_CONFLICT') {
        const cart = (await this.client.cart()).data;

        if (revision !== this.epoch) return null;

        this.set({ cart });
        this.scheduleQuote();
      }

      throw error;
    } finally {
      if (revision === this.epoch) this.set({ quoting: false });
    }
  }

  /** Перечитывает корзину и принудительно обновляет серверный расчёт. */
  recalculate = () =>
    this.run(async () => {
      this.set({ cart: (await this.client.cart()).data });
      await this.refreshQuote();
    });

  /** Оформляет заказ или повторяет неопределённый POST с тем же телом и ключом. */
  submit = () =>
    this.run(async () => {
      let pending = readStorage<Attempt<CreateOrder> | null>('checkout.orderAttempt', null);

      if (!pending) {
        const fields = validate(this.state.draft);

        this.set({ fields });

        if (Object.keys(fields).length) throw new ApiError(checkoutErrorText.invalidFields, 'FORM');

        if (!this.state.cart?.items.length)
          throw new ApiError(checkoutErrorText.emptyCart, 'CART_EMPTY', 422);

        const quote = await this.refreshQuote();

        if (!quote) throw new ApiError(checkoutErrorText.dataChanged, 'QUOTE_CHANGED');

        pending = attempt({
          quoteId: quote.id,
          customer: { ...this.state.draft.customer },
          paymentMethod: this.state.draft.paymentMethod,
        });
        saveStorage('checkout.orderAttempt', pending);
        this.set({ orderUncertain: true });
      }

      try {
        const order = (await this.client.createOrder(pending.body, pending.key)).data;

        saveStorage('checkout.order', order.id);
        saveStorage('checkout.orderAttempt', null);
        this.set({
          order,
          orders: this.rememberOrder(order),
          payment: null,
          simulation: null,
          orderUncertain: false,
          quote: null,
        });
        this.navigate('order');
        this.set({ cart: (await this.client.cart()).data });
      } catch (error) {
        const parsed = asError(error);

        if (!parsed.uncertain) {
          saveStorage('checkout.orderAttempt', null);
          this.set({ orderUncertain: false });
        }

        if (['QUOTE_EXPIRED', 'CART_VERSION_CONFLICT'].includes(parsed.code)) {
          this.set({ cart: (await this.client.cart()).data });
          await this.refreshQuote();

          throw new ApiError(checkoutErrorText.quoteChanged, parsed.code, parsed.status);
        }

        if (parsed.fields.length) {
          const fields: Record<string, string> = {};

          for (const field of parsed.fields)
            fields[field.path.split('/').at(-1)!] = checkoutErrorText.invalidField;

          this.set({ fields });
        }

        throw parsed;
      }
    });

  /** Начинает разрешённую попытку оплаты с восстановлением ключа при повторе. */
  startPayment = () =>
    this.run(async () => {
      const order = this.state.order;

      if (
        !order ||
        !canStartPayment(paymentPhase(order, this.state.payment, this.state.orderLoading))
      )
        return;

      this.monitor?.abort();

      let pending = readStorage<Attempt<PaymentAttemptBody> | null>(
        'checkout.paymentAttempt',
        null,
      );

      if (pending && pending.body.orderId !== order.id) {
        await this.client.createPayment(pending.body.orderId, pending.key);
        saveStorage('checkout.paymentAttempt', null);
        pending = null;
      }

      if (!pending || pending.body.orderId !== order.id) {
        pending = attempt({ orderId: order.id });
        saveStorage('checkout.paymentAttempt', pending);
      }

      try {
        const payment = (await this.client.createPayment(order.id, pending.key)).data;

        saveStorage('checkout.paymentAttempt', null);
        saveStorage('checkout.payment', payment.id);
        this.set({ payment, simulation: readStorage(`checkout.simulation.${payment.id}`, null) });
        this.watch();
      } catch (error) {
        const parsed = asError(error);

        if (!parsed.uncertain) saveStorage('checkout.paymentAttempt', null);

        if (['PAYMENT_IN_PROGRESS', 'ORDER_ALREADY_PAID'].includes(parsed.code))
          await this.loadOrder();

        throw parsed;
      }
    });

  /** Запускает тестовый сценарий или возобновляет проверку уже начатой оплаты. */
  simulate = (scenario: Scenario) =>
    this.run(async () => {
      const payment = this.state.payment;

      if (!payment) return;

      if (paymentPhase(this.state.order, payment, this.state.orderLoading) !== 'choosing_card') {
        // Предыдущая симуляция могла завершиться успешно до ошибки последующего GET.
        await this.loadOrder();
        this.watch();
        return;
      }

      const saved = readStorage<Scenario | null>(`checkout.simulation.${payment.id}`, null);
      const chosen = saved ?? scenario;

      saveStorage(`checkout.simulation.${payment.id}`, chosen);
      this.set({ simulation: chosen });
      await this.client.simulate(payment.id, chosen);
      this.set({ payment: (await this.client.payment(payment.id)).data });
      await this.loadOrder();
      this.watch();
    });

  /** Перечитывает заказ и его платежи, не подменяя данные другого открытого заказа. */
  private async loadOrder(signal?: AbortSignal) {
    const id = this.state.order?.id;

    if (!id) return;

    const [order, payments] = await Promise.all([
      this.client.order(id, signal),
      this.client.payments(id),
    ]);

    if (signal?.aborted || this.state.order?.id !== id) return;

    const payment = payments.data[0] ?? null;

    this.set({
      order: order.data,
      orders: this.rememberOrder(order.data),
      payment,
      simulation: payment ? readStorage(`checkout.simulation.${payment.id}`, null) : null,
    });
  }

  /** Обновляет заказ вручную и при необходимости возобновляет опрос. */
  refreshOrder = () =>
    this.run(async () => {
      await this.loadOrder();
      this.watch();
    });

  /** Ожидает итог платежа и подтверждение заказа только на экране оплаты. */
  private watch() {
    this.monitor?.abort();

    const payment = this.state.payment;
    const order = this.state.order;
    const phase = paymentPhase(order, payment, this.state.orderLoading);

    if (
      this.state.page !== 'order' ||
      !order ||
      !payment ||
      !['processing', 'verifying_order'].includes(phase)
    )
      return;

    const controller = new AbortController();

    this.monitor = controller;

    const work =
      phase === 'verifying_order'
        ? poll(
            (signal) => this.client.order(order.id, signal).then((reply) => reply.data),
            (value) => paymentComplete(paymentPhase(value, payment)),
            (value) => {
              if (this.state.order?.id === value.id)
                this.set({ order: value, orders: this.rememberOrder(value) });
            },
            controller.signal,
          )
        : poll(
            (signal) => this.client.payment(payment.id, signal).then((r) => r.data),
            (value) => value.status !== 'processing',
            (value) => {
              if (this.state.payment?.id === payment.id) this.set({ payment: value });
            },
            controller.signal,
          ).then(async () => {
            if (!controller.signal.aborted) {
              await this.loadOrder(controller.signal);

              if (!controller.signal.aborted) this.watch();
            }
          });

    void work.catch((error) => {
      if (!controller.signal.aborted) {
        this.lastAction = async () => {
          await this.loadOrder();
          this.watch();
        };
        this.set({ error: asError(error) });
      }
    });
  }

  /** Отменяет активные чтения, опрос оплаты и отложенный расчёт. */
  close = () => {
    this.orderController?.abort();
    this.ordersController?.abort();
    this.monitor?.abort();
    this.invalidateQuote();
  };
}

export const checkout = new Checkout();
