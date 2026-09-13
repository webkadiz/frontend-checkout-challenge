import { Button } from '../ui';
import { ArrowUpRight } from 'lucide-react';
import { menuText } from '../../constants/menu';
import style from './FullscreenMenu.module.scss';
import type { MenuLink } from '../../constants/types';
import type { FullscreenMenuProps } from './FullscreenMenu';

/** Ссылка меню, её состояние и обработчик перехода. */
export type MenuNavigationItemProps = {
  /** Раздел, заголовок и пояснение ссылки. */
  link: MenuLink;
  /** Позиция ссылки для нумерации и задержки анимации. */
  index: number;
  /** Соответствует ли ссылка текущему разделу. */
  active: boolean;
  /** Заблокирован ли переход по ссылке. */
  disabled: boolean;
  /** Переходит в раздел выбранной ссылки. */
  onNavigate: FullscreenMenuProps['onNavigate'];
};

/** Отдельный пункт навигации с подписью, состоянием и собственным обработчиком выбора. */
export const MenuNavigationItem = ({
  link,
  index,
  active,
  disabled,
  onNavigate,
}: MenuNavigationItemProps) => {
  const handleClick = () => onNavigate(link.page);

  return (
    <Button
      type="button"
      className={style.menuLink}
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      onClick={handleClick}
    >
      <span className={style.menuLinkIndex}>
        {menuText.numberPrefix}
        {index + 1}
      </span>
      <span className={style.menuLinkMain}>
        <span>{link.title}</span>
        <small>{link.note}</small>
      </span>
      <span className={style.menuLinkArrow} aria-hidden="true">
        <ArrowUpRight size="1em" aria-hidden="true" />
      </span>
    </Button>
  );
};
