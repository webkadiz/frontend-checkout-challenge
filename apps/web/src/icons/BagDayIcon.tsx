import { productArtText } from '../constants/catalog';
import { ProductIcon } from './ProductIcon';

/** Иллюстрация сумки «День» с подписью из констант интерфейса. */
export const BagDayIcon = () => {
  return (
    <ProductIcon>
      <ellipse cx="159" cy="228" rx="68" ry="8" fill="#c8c2b4" />
      <path d="M91 99h138l-9 122H100L91 99Z" fill="#d3c8a9" />
      <path d="M126 107V70c0-40 69-40 69 0v37" stroke="#a49a7b" strokeWidth="12" />
      <path d="m104 105 10 105h89l13-104" stroke="#b6ab8b" strokeWidth="2" />
      <text x="159" y="173" textAnchor="middle" fill="#616955" fontSize="25" fontFamily="serif">
        {productArtText.bagLabel}
      </text>
    </ProductIcon>
  );
};
