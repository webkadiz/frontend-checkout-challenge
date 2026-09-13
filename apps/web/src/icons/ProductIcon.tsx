import type { ReactNode } from 'react';

/** Содержимое SVG-иллюстрации в общей системе координат. */
export type ProductIconProps = {
  /** SVG-элементы, из которых состоит иллюстрация товара. */
  children: ReactNode;
};

/** Задаёт общую область рисования для иллюстраций товаров. */
export const ProductIcon = ({ children }: ProductIconProps) => {
  return (
    <svg viewBox="0 0 320 260" fill="none">
      {children}
    </svg>
  );
};
