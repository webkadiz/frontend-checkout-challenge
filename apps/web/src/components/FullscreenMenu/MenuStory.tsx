import { menuText } from '../../constants/menu';
import style from './FullscreenMenu.module.scss';

/** Декоративная иллюстрация и короткое описание магазина рядом с навигацией. */
export const MenuStory = () => {
  return (
    <aside className={style.menuStory}>
      <div className={style.menuFlower} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <p>
        {menuText.storyTitle}
        <br />
        <em>{menuText.storyEmphasis}</em>
      </p>
      <span>
        {menuText.storyStart}
        <br />
        {menuText.storyEnd}
      </span>
    </aside>
  );
};
