import { ProductIcon } from './ProductIcon';

/** Иллюстрация настенных часов «Точка». */
export const ClockDotIcon = () => {
  return (
    <ProductIcon>
      <circle cx="160" cy="137" r="87" fill="#c4beb1" />
      <circle cx="160" cy="132" r="82" fill="#e7e1d5" stroke="#9d9586" strokeWidth="5" />
      <path d="M160 79v53l34 24" stroke="#666556" strokeWidth="5" strokeLinecap="round" />
      <circle cx="160" cy="132" r="5" fill="#666556" />
      <path d="M160 62v8m0 124v8m-70-70h8m124 0h8" stroke="#8f8d80" strokeWidth="3" />
    </ProductIcon>
  );
};
