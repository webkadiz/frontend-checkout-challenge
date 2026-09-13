import type { RefObject, ReactEventHandler, TransitionEventHandler } from 'react';
import type { FullscreenMenuProps } from './FullscreenMenu';

/** Состояние и обработчики жизненного цикла полноэкранного меню. */
export type FullscreenMenuController = {
  /** Открыта ли панель меню. */
  open: boolean;
  /** Выполняется ли анимация закрытия. */
  closing: boolean;
  /** Ссылка на нативный диалог меню. */
  dialog: RefObject<HTMLDialogElement | null>;
  /** Кнопка, которой возвращается фокус после закрытия. */
  trigger: RefObject<HTMLButtonElement | null>;
  /** Идентификатор диалога для связи с кнопкой открытия. */
  id: string;
  /** Запускает закрытие с учётом настройки сокращённых анимаций. */
  close: () => void;
  /** Закрывает меню и затем переходит в выбранный раздел. */
  navigate: FullscreenMenuProps['onNavigate'];
  /** Открывает панель меню. */
  handleOpen: () => void;
  /** Заменяет штатное закрытие по Escape анимированным. */
  handleCancel: ReactEventHandler<HTMLDialogElement>;
  /** Сбрасывает состояние после закрытия нативного диалога. */
  handleClose: () => void;
  /** Завершает закрытие после анимации затухания панели. */
  handleTransitionEnd: TransitionEventHandler<HTMLDialogElement>;
};
