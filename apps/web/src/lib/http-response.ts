import { AxiosHeaders } from 'axios';
import type { AxiosResponse } from 'axios';
import type { Reply } from './types';
import { ApiError } from './api-error';
import { errorText } from '../constants/errors';

/** Принимает успешные ответы и ответ о неизменившемся ресурсе. */
export function isAcceptedStatus(status: number) {
  return (status >= 200 && status < 300) || status === 304;
}

/** Извлекает данные из оболочки магазина перед передачей ответа вызывающему коду. */
export function normalizeResponse(response: AxiosResponse<unknown>) {
  if (
    response.status === 204 ||
    response.status === 304 ||
    response.config.method === 'head' ||
    response.data === '' ||
    response.data === undefined
  ) {
    response.data = undefined;
    return response;
  }

  const body = response.data;

  if (!body || typeof body !== 'object' || !('data' in body)) {
    const requestId = AxiosHeaders.from(response.headers as AxiosHeaders).get('x-request-id');

    throw new ApiError(
      errorText.missingData,
      'PARSE',
      0,
      [],
      typeof requestId === 'string' ? requestId : undefined,
    );
  }

  response.data = body.data;

  return response;
}

/** Передаёт моделям данные и метаданные ответа, не меняя правила сохранения и опроса. */
export function toReply<T>(response: AxiosResponse<T>): Reply<T> {
  const headers = AxiosHeaders.from(response.headers as AxiosHeaders);
  const retry = Number(headers.get('retry-after'));
  const etag = headers.get('etag');

  return {
    data: response.data,
    status: response.status,
    etag: typeof etag === 'string' ? etag : null,
    retryMs: Number.isFinite(retry) && retry > 0 ? retry * 1000 : 1000,
  };
}
