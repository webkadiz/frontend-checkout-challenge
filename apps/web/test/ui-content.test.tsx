// @vitest-environment jsdom
import { createRef } from 'react';
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { DescriptionList, DescriptionItem, LoadingIndicator, Skeleton } from '../src/components/ui';
import style from '../src/components/ui/DescriptionList/DescriptionList.module.scss';

afterEach(cleanup);

it('renders semantic description terms and values with a highlighted total', () => {
  const { container } = render(
    <DescriptionList aria-label="Amounts" className="custom">
      <DescriptionItem label="Delivery">100</DescriptionItem>
      <DescriptionItem label="Total" prominent>
        500
      </DescriptionItem>
    </DescriptionList>,
  );
  expect(container.querySelector('dl')?.getAttribute('aria-label')).toBe('Amounts');
  expect(container.querySelector('dl')?.classList.contains('custom')).toBe(true);
  expect(screen.getAllByRole('term').map((node) => node.textContent)).toEqual([
    'Delivery',
    'Total',
  ]);
  expect(screen.getAllByRole('definition').map((node) => node.textContent)).toEqual(['100', '500']);
  expect(screen.getByText('Total').parentElement?.classList.contains(style.prominent)).toBe(true);
});

it('preserves live-region attributes and content while a value is updating', () => {
  const ref = createRef<HTMLElement>();

  const { rerender } = render(
    <DescriptionList>
      <DescriptionItem label="Total" valueProps={{ ref, 'aria-live': 'polite', 'aria-busy': true }}>
        <strong>500</strong>
      </DescriptionItem>
    </DescriptionList>,
  );

  const value = screen.getByRole('definition');
  expect(ref.current).toBe(value);
  expect(value.getAttribute('aria-live')).toBe('polite');
  expect(value.getAttribute('aria-busy')).toBe('true');
  expect(value.querySelector('strong')?.textContent).toBe('500');
  rerender(
    <DescriptionList>
      <DescriptionItem label="Total" valueProps={{ 'aria-live': 'polite', 'aria-busy': false }}>
        600
      </DescriptionItem>
    </DescriptionList>,
  );
  expect(screen.getByRole('definition').textContent).toBe('600');
  expect(screen.getByRole('definition').getAttribute('aria-busy')).toBe('false');
});

it('exposes the loading label while hiding decorative dots', () => {
  const ref = createRef<HTMLSpanElement>();
  render(<LoadingIndicator ref={ref} label="Loading" role="status" className="custom" />);
  const indicator = screen.getByRole('status');
  expect(ref.current).toBe(indicator);
  expect(indicator.textContent).toBe('Loading');
  expect(indicator.classList.contains('custom')).toBe(true);
  expect(indicator.querySelector('[aria-hidden="true"]')?.querySelectorAll('i')).toHaveLength(3);
});

it('keeps skeletons decorative and accepts layout overrides', () => {
  const ref = createRef<HTMLDivElement>();
  render(<Skeleton ref={ref} className="custom" style={{ height: 20 }} />);
  expect(ref.current?.getAttribute('aria-hidden')).toBe('true');
  expect(ref.current?.classList.contains('custom')).toBe(true);
  expect(ref.current?.style.height).toBe('20px');
});
