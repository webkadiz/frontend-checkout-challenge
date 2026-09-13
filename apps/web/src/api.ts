import type { Options, Sandbox } from './types';
import type { Static } from '@sinclair/typebox';
import type {
  Cart,
  Product,
  Quote,
  Order,
  Payment,
  Simulation,
  Delivery,
  CreateOrder,
  Scenario,
  SessionSchema,
} from '@checkout/contracts';
import { http } from './lib/http';
import { toReply } from './lib/http-response';

/** Типизированные операции магазина на стандартных методах Axios. */
export const api = {
  session: () => http.post<Static<typeof SessionSchema>>('/api/sessions', {}).then(toReply),
  products: () => http.get<Product[]>('/api/products').then(toReply),
  cart: () => http.get<Cart>('/api/cart').then(toReply),
  options: () => http.get<Options>('/api/checkout/options').then(toReply),
  sandbox: () => http.get<Sandbox>('/api/sandbox').then(toReply),
  setItem: (id: string, quantity: number) =>
    http.put<unknown>(`/api/cart/items/${encodeURIComponent(id)}`, { quantity }).then(toReply),
  deleteItem: (id: string) =>
    http.delete<void>(`/api/cart/items/${encodeURIComponent(id)}`).then(toReply),
  quote: (cartVersion: number, delivery: Delivery, signal?: AbortSignal) =>
    http.post<Quote>('/api/quotes', { cartVersion, delivery }, { signal }).then(toReply),
  orders: () => http.get<Order[]>('/api/orders').then(toReply),
  order: (id: string, signal?: AbortSignal) =>
    http.get<Order>(`/api/orders/${id}`, { signal }).then(toReply),
  createOrder: (body: CreateOrder, key: string) =>
    http.post<Order>('/api/orders', body, { headers: { 'Idempotency-Key': key } }).then(toReply),
  payments: (id: string) => http.get<Payment[]>(`/api/orders/${id}/payments`).then(toReply),
  createPayment: (id: string, key: string) =>
    http
      .post<Payment>(`/api/orders/${id}/payments`, {}, { headers: { 'Idempotency-Key': key } })
      .then(toReply),
  payment: (id: string, signal?: AbortSignal) =>
    http.get<Payment>(`/api/payments/${id}`, { signal }).then(toReply),
  simulate: (id: string, scenario: Scenario) =>
    http.post<Simulation>(`/api/payments/${id}/simulations`, { scenario }).then(toReply),
};
