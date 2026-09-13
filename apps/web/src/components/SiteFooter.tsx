import style from '../App.module.scss';
import { appText } from '../constants/app';

/** Нижняя часть магазина со справочной информацией. */
export const SiteFooter = () => {
  return (
    <footer>
      <span className={style.footerBrand}>{appText.brand}</span>
      <span>{appText.footer}</span>
      <small>{appText.edition}</small>
    </footer>
  );
};
