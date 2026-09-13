import { getMenuLinks, menuText } from '../../constants/menu';
import style from './FullscreenMenu.module.scss';
import { MenuNavigationItem } from './MenuNavigationItem';
import type { FullscreenMenuProps } from './FullscreenMenu';

/** Текущий раздел и переходы для списка ссылок меню. */
export type MenuNavigationProps = FullscreenMenuProps;

/** Строит пункты меню с текущим разделом и актуальным количеством товаров. */
export const MenuNavigation = ({
  page,
  quantity,
  canNavigate,
  onNavigate,
}: MenuNavigationProps) => {
  const links = getMenuLinks(quantity);

  return (
    <nav className={style.menuLinks} aria-label={menuText.navigation}>
      {links.map((link, index) => (
        <MenuNavigationItem
          key={link.page}
          link={link}
          index={index}
          active={page === link.page || (page === 'order' && link.page === 'orders')}
          disabled={!canNavigate}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
};
