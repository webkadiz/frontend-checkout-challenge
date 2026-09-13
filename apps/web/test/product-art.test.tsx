// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProductArt } from '../src/components/ProductArt';
import { BagDayIcon, ClockDotIcon, LampOrbitIcon, MugLineIcon } from '../src/icons';
import style from '../src/App.module.scss';

afterEach(cleanup);

it.each([
  ['lamp-orbit', LampOrbitIcon],
  ['mug-line', MugLineIcon],
  ['bag-day', BagDayIcon],
  ['clock-dot', ClockDotIcon],
] as const)('preserves the original SVG markup for %s', (id, Icon) => {
  const { container } = render(<ProductArt id={id} />);

  expect(container.querySelector('svg')?.outerHTML).toBe(renderToStaticMarkup(<Icon />));
  expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
});

it('keeps the small layout and product-specific background', () => {
  const { container } = render(<ProductArt id="mug-line" small />);

  expect(container.firstElementChild?.classList.contains(style.small)).toBe(true);
  expect(container.firstElementChild?.classList.contains(style.artMugLine)).toBe(true);
});

it('preserves the default clock illustration for unknown products', () => {
  const { container } = render(<ProductArt id="unknown" />);

  expect(container.querySelector('svg')?.outerHTML).toBe(renderToStaticMarkup(<ClockDotIcon />));
  expect(container.firstElementChild?.classList.contains(style.artClockDot)).toBe(false);
});
