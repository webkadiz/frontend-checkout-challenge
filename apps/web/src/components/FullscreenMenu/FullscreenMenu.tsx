import { MenuPanel } from './MenuPanel';
import { MenuTrigger } from './MenuTrigger';
import { useFullscreenMenu } from '../../hooks/useFullscreenMenu';
import type { Page } from '../../lib/types';

/** Раздел магазина и действия полноэкранного меню. */
export type FullscreenMenuProps = {
  /** Текущий раздел магазина. */
  page: Page;
  /** Общее количество единиц товара в корзине. */
  quantity: number;
  /** Разрешены ли переходы между разделами. */
  canNavigate: boolean;
  /** Переходит в выбранный раздел магазина. */
  onNavigate: (page: Page) => void;
};

/** Собирает кнопку и панель меню, делегируя управление состоянием отдельному хуку. */
export const FullscreenMenu = ({
  page,
  quantity,
  canNavigate,
  onNavigate,
}: FullscreenMenuProps) => {
  const menu = useFullscreenMenu({ canNavigate, onNavigate });

  return (
    <>
      <MenuTrigger
        id={menu.id}
        open={menu.open}
        trigger={menu.trigger}
        handleOpen={menu.handleOpen}
      />
      <MenuPanel page={page} quantity={quantity} canNavigate={canNavigate} menu={menu} />
    </>
  );
};
