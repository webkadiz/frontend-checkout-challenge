import { IconButton } from '../ui';
import classNames from 'classnames';
import { menuText } from '../../constants/menu';
import style from './FullscreenMenu.module.scss';
import { MenuIcon } from './MenuIcon';
import type { FullscreenMenuController } from './types';

/** Состояние закрытия и действие закрытия шапки меню. */
export type MenuHeaderProps = Pick<FullscreenMenuController, 'closing' | 'close'>;

/** Шапка панели с брендом и доступной кнопкой анимированного закрытия. */
export const MenuHeader = ({ closing, close }: MenuHeaderProps) => {
  return (
    <div className={style.menuHeading}>
      <span className={style.menuWordmark}>
        {menuText.brand}
        <sup>{menuText.registered}</sup>
      </span>
      <span className={style.menuEdition}>{menuText.edition}</span>
      <IconButton
        type="button"
        className={classNames(style.menuToggle, style.menuClose)}
        aria-label={menuText.close}
        autoFocus
        onClick={close}
      >
        <MenuIcon close={!closing} />
      </IconButton>
    </div>
  );
};
