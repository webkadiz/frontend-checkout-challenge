import { CATALOG_SKELETONS, loadingText } from '../constants/loading';
import { LoadingIndicator, Skeleton } from './ui';
import style from '../App.module.scss';

/** Сохраняет структуру каталога, пока загружаются товары. */
export const CatalogLoading = () => {
  return (
    <section className={style.catalogLoading} aria-busy="true" aria-label={loadingText.label}>
      <div className={style.loadingIntro} role="status">
        <span className={style.loadingEmblem} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <p className={style.eyebrow}>{loadingText.eyebrow}</p>
        <h1>
          {loadingText.title}
          <em>{loadingText.emphasis}</em>
        </h1>
        <LoadingIndicator className={style.catalogLoadingStatus} label={loadingText.status} />
      </div>
      <div className={style.productGrid} aria-hidden="true">
        {CATALOG_SKELETONS.map((index) => (
          <div className={style.skeletonCard} key={index}>
            <Skeleton className={style.skeletonArt} />
            <Skeleton className={style.skeletonTitle} />
            <Skeleton className={style.skeletonCopy} />
            <Skeleton className={style.skeletonActions} />
          </div>
        ))}
      </div>
    </section>
  );
};
