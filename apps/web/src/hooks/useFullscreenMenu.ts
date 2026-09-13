import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { Page } from '../lib/types';
import type { ReactEventHandler, TransitionEventHandler } from 'react';
import type { FullscreenMenuController } from '../components/FullscreenMenu/types';
import type { FullscreenMenuProps } from '../components/FullscreenMenu/FullscreenMenu';

/** Разрешение навигации и обработчик перехода для управления меню. */
export type UseFullscreenMenuOptions = Pick<FullscreenMenuProps, 'canNavigate' | 'onNavigate'>;

/** Управляет анимацией меню, отложенной навигацией, блокировкой прокрутки и возвратом фокуса. */
export const useFullscreenMenu = ({
  canNavigate,
  onNavigate,
}: UseFullscreenMenuOptions): FullscreenMenuController => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const pendingNavigation = useRef<Page | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;

    const element = dialog.current!;
    const triggerElement = trigger.current;
    const overflow = document.body.style.overflow;

    element.showModal();
    document.body.style.overflow = 'hidden';

    return () => {
      if (element.open) element.close();

      document.body.style.overflow = overflow;
      triggerElement?.focus({ preventScroll: true });
    };
  }, [open]);

  const finishClose = useCallback(() => {
    setOpen(false);
    setClosing(false);

    const next = pendingNavigation.current;

    pendingNavigation.current = null;

    if (next) {
      onNavigate(next);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [onNavigate]);

  useEffect(() => {
    if (!closing) return;

    // Закрываем меню и при отмене перехода или отсутствии события его завершения.
    const timer = window.setTimeout(finishClose, 500);

    return () => window.clearTimeout(timer);
  }, [closing, finishClose]);

  const close = () => {
    if (closing) return;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) finishClose();
    else setClosing(true);
  };

  const navigate = (next: Page) => {
    if (!canNavigate || closing) return;

    pendingNavigation.current = next;
    close();
  };

  const handleOpen = () => setOpen(true);

  const handleCancel: ReactEventHandler<HTMLDialogElement> = (event) => {
    event.preventDefault();
    close();
  };

  const handleClose = () => {
    setOpen(false);
    setClosing(false);
  };

  const handleTransitionEnd: TransitionEventHandler<HTMLDialogElement> = (event) => {
    if (closing && event.target === event.currentTarget && event.propertyName === 'opacity')
      finishClose();
  };

  return {
    open,
    closing,
    dialog,
    trigger,
    id,
    close,
    navigate,
    handleOpen,
    handleCancel,
    handleClose,
    handleTransitionEnd,
  };
};
