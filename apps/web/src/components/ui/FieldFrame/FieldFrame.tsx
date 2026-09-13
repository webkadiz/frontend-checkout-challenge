import style from './FieldFrame.module.scss';
import type { ReactNode } from 'react';

/** Обрамление поля с подписью и сообщением об ошибке. */
export type FieldFrameProps = {
  /** Идентификатор поля для формирования доступных связей. */
  id: string;
  /** Видимая подпись поля. */
  label: string;
  /** Сообщение об ошибке; отсутствие значения скрывает его. */
  error?: string;
  /** Элемент ввода, размещаемый внутри обрамления. */
  children: ReactNode;
};

/** Общая подпись и ошибка поля; нажатие на подпись не переводит фокус. */
export const FieldFrame = ({ id, label, error, children }: FieldFrameProps) => {
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  return (
    <div className={style.field}>
      <span id={labelId}>{label}</span>
      {children}
      {error && (
        <small id={errorId} className={style.fieldError}>
          {error}
        </small>
      )}
    </div>
  );
};
