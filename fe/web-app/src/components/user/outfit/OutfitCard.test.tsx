import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { OutfitCard } from './OutfitCard';

afterEach(cleanup);

const suggestion = {
  items: [
    { id: 'a', category: 'TOP' },
    { id: 'b', category: 'BOTTOM' },
  ],
  occasion: 'WORK' as const,
  score: 0.857,
  reason: 'Hợp dịp đi làm · Có món 21 ngày chưa mặc',
};

describe('OutfitCard', () => {
  it('hiện dịp, độ phù hợp, các món và lý do', () => {
    render(<OutfitCard suggestion={suggestion} />);
    expect(screen.getByText('Đi làm')).toBeTruthy();
    expect(screen.getByText('86%')).toBeTruthy();
    expect(screen.getByTitle('Áo')).toBeTruthy();
    expect(screen.getByTitle('Quần')).toBeTruthy();
    expect(screen.getByText(suggestion.reason)).toBeTruthy();
  });

  it('gợi ý Quick Pick (không có dịp) hiện nhãn Quick Pick', () => {
    render(<OutfitCard suggestion={{ ...suggestion, occasion: undefined }} />);
    expect(screen.getByText('Quick Pick')).toBeTruthy();
  });
});
