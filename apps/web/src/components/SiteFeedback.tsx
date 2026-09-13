import { Button } from './ui';
import { appText } from '../constants/app';
import { ErrorNotice } from './ErrorNotice';
import type { ApiError } from '../lib/http';

/** Ошибка магазина и действия восстановления сессии. */
export type SiteFeedbackProps = {
  /** Ошибка для отображения; null при её отсутствии. */
  error: ApiError | null;
  /** Повторяет неудавшееся действие. */
  onRetry: () => void;
  /** Начинает новую сессию магазина. */
  onNewSession: () => void;
};

/** Показывает общую ошибку и доступные действия восстановления. */
export const SiteFeedback = ({ error, onRetry, onNewSession }: SiteFeedbackProps) => {
  return (
    <>
      <ErrorNotice error={error} retry={onRetry} />
      {error?.status === 401 && (
        <Button variant="secondary" onClick={onNewSession}>
          {appText.newSession}
        </Button>
      )}
    </>
  );
};
