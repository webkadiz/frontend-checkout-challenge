import { IconButton } from '../ui';
import { menuText } from '../../constants/menu';
import style from './FullscreenMenu.module.scss';
import { MenuIcon } from './MenuIcon';
import type { FullscreenMenuController } from './types';

/** Состояние, ссылка на кнопку и действие открытия меню. */
export type MenuTriggerProps = Pick<
  FullscreenMenuController,
  'id' | 'open' | 'trigger' | 'handleOpen'
>;

/** Кнопка открытия меню с состоянием панели и точкой возврата фокуса. */
export const MenuTrigger = ({ id, open, trigger, handleOpen }: MenuTriggerProps) => {
  return (
    <IconButton
      ref={trigger}
      type="button"
      className={style.menuToggle}
      aria-label={menuText.open}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={id}
      onClick={handleOpen}
    >
      <MenuIcon />
    </IconButton>
  );
};
