import classNames from 'classnames';
import { createPortal } from 'react-dom';
import { menuText } from '../../constants/menu';
import style from './FullscreenMenu.module.scss';
import { MenuFooter } from './MenuFooter';
import { MenuHeader } from './MenuHeader';
import { MenuNavigation } from './MenuNavigation';
import { MenuStory } from './MenuStory';
import type { FullscreenMenuProps } from './FullscreenMenu';
import type { FullscreenMenuController } from './types';

/** Данные навигации и контроллер панели меню. */
export type MenuPanelProps = Pick<FullscreenMenuProps, 'page' | 'quantity' | 'canNavigate'> & {
  /** Управляет диалогом, закрытием и отложенными переходами. */
  menu: FullscreenMenuController;
};

/** Размещает составные блоки меню в нативном диалоге вне дерева шапки магазина. */
export const MenuPanel = ({ page, quantity, canNavigate, menu }: MenuPanelProps) => {
  const titleId = `${menu.id}-title`;

  return createPortal(
    <dialog
      ref={menu.dialog}
      id={menu.id}
      className={classNames(style.fullscreenMenu, { [style.isClosing]: menu.closing })}
      aria-labelledby={titleId}
      onCancel={menu.handleCancel}
      onClose={menu.handleClose}
      onTransitionEnd={menu.handleTransitionEnd}
    >
      <div className={style.menuShell}>
        <MenuHeader closing={menu.closing} close={menu.close} />
        <h2 id={titleId} className={style.menuKicker}>
          {menuText.title}
        </h2>
        <div className={style.menuContent}>
          <MenuNavigation
            page={page}
            quantity={quantity}
            canNavigate={canNavigate}
            onNavigate={menu.navigate}
          />
          <MenuStory />
        </div>
        <MenuFooter />
      </div>
    </dialog>,
    document.body,
  );
};
