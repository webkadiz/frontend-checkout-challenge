import { Outlet } from 'react-router';
import type { CheckoutStateProps } from './types';
import { appText } from '../constants/app';
import { CatalogLoading } from './Loading';
import { Empty } from './ui';

/** Показывает состояние загрузки, затем экран выбранного маршрута. */
export const ShopContent = ({ state }: CheckoutStateProps) => {
  if (state.ready) return <Outlet />;

  if (!state.error) return <CatalogLoading />;

  return (
    <Empty title={appText.unavailableTitle}>
      <p>{appText.unavailableHint}</p>
    </Empty>
  );
};
