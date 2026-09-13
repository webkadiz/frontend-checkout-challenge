import { menuText } from '../../constants/menu';
import style from './FullscreenMenu.module.scss';

/** Завершает панель слоганом и пояснением учебного режима магазина. */
export const MenuFooter = () => {
  return (
    <div className={style.menuFooter}>
      <span>{menuText.footer}</span>
      <small>{menuText.disclaimer}</small>
    </div>
  );
};
