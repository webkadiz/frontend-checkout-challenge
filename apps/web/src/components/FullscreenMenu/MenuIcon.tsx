import { Menu, X } from 'lucide-react';
import classNames from 'classnames';
import style from './FullscreenMenu.module.scss';

/** Вариант значка открытия или закрытия меню. */
export type MenuIconProps = {
  /** Показывать ли значок закрытия вместо гамбургера. */
  close?: boolean;
};

/** Меняет значок меню на крестик при открытой панели. */
export const MenuIcon = ({ close = false }: MenuIconProps) => {
  return (
    <span
      className={classNames(style.menuToggleIcon, { [style.isClose]: close })}
      aria-hidden="true"
    >
      {close ? <X size={20} /> : <Menu size={20} />}
    </span>
  );
};
