import { ProductIcon } from './ProductIcon';

/** Иллюстрация настольной лампы «Орбита». */
export const LampOrbitIcon = () => {
  return (
    <ProductIcon>
      <ellipse cx="160" cy="225" rx="67" ry="10" fill="#c4bfae" />
      <path d="M165 121v96" stroke="#464940" strokeWidth="9" />
      <ellipse cx="165" cy="216" rx="47" ry="8" fill="#53594b" />
      <path d="M95 124c0-47 29-77 70-77s70 30 70 77H95Z" fill="#72795f" />
      <ellipse cx="165" cy="124" rx="70" ry="8" fill="#d8d6b1" />
      <path d="M116 99c5-20 18-34 35-39" stroke="#9da58b" strokeWidth="4" strokeLinecap="round" />
    </ProductIcon>
  );
};
