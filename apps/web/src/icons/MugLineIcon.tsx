import { ProductIcon } from './ProductIcon';

/** Иллюстрация керамической кружки «Линия». */
export const MugLineIcon = () => {
  return (
    <ProductIcon>
      <ellipse cx="151" cy="219" rx="71" ry="9" fill="#c6bcae" />
      <path d="M202 105h22c43 0 36 68-14 69" stroke="#bb7954" strokeWidth="16" />
      <path d="M91 92h119l-9 108c-2 24-93 24-96 0L91 92Z" fill="#c68a64" />
      <ellipse cx="150" cy="92" rx="60" ry="15" fill="#dfba91" />
      <ellipse cx="150" cy="92" rx="49" ry="10" fill="#754e36" />
      <path
        d="m112 121 7 72M131 121l3 77M151 123v77M171 121l-3 77M191 120l-7 74"
        stroke="#e5b28b"
        strokeWidth="3"
      />
    </ProductIcon>
  );
};
