import axios, { type InternalAxiosRequestConfig } from 'axios';
import { isAcceptedStatus, normalizeResponse } from './http-response';
import { rejectApiError } from './api-error';
import { readStorage } from './storage';

export { ApiError, asError } from './api-error';

/** Экземпляр Axios для API: JSON, отмена запросов и единая обработка ошибок. */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: { Accept: 'application/json' },
  responseType: 'json',
  transitional: { silentJSONParsing: false },
  validateStatus: isAcceptedStatus,
});

/** Подставляет актуальный токен перед каждым запросом, включая смену гостевой сессии. */
function authorizeRequest(config: InternalAxiosRequestConfig) {
  const token = readStorage<string | null>('checkout.token', null);

  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  else config.headers.delete('Authorization');

  return config;
}

http.interceptors.request.use(authorizeRequest);

http.interceptors.response.use(normalizeResponse, rejectApiError);
