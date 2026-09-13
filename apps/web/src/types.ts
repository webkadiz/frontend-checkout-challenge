import type { Static } from '@sinclair/typebox';
import type { CheckoutOptionsSchema, SandboxSchema } from '@checkout/contracts';
import type { api } from './api';

/** Справочники оформления, выведенные из схемы контракта API. */
export type Options = Static<typeof CheckoutOptionsSchema>;

/** Настройки тестовых карт и сценариев оплаты из схемы API. */
export type Sandbox = Static<typeof SandboxSchema>;

/** Контракт методов API, используемых моделью магазина. */
export type CheckoutApi = typeof api;
