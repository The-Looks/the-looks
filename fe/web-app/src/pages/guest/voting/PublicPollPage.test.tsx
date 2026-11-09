import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { PublicPollPage } from './PublicPollPage';

vi.mock('../../../hooks/guest/voting/api', () => ({
  usePoll: () => ({ data: {
    question: 'Đi học nên mặc gì?', expiresAt: '2099-11-10T00:00:00Z',
    optionA: { imageUrls: ['/shirt.jpg', '/pants.jpg', '/shoes.jpg'] },
    optionB: { imageUrls: ['/dress.jpg', '/bag.jpg'] },
  }, isPending: false, isError: false }),
  useCastVote: () => ({ isPending: false, isSuccess: false, isError: false, data: null, mutate: vi.fn() }),
}));

afterEach(cleanup);

it('shows all item photos in each voting option', () => {
  render(<MemoryRouter initialEntries={['/v/test']}><Routes><Route path="/v/:code" element={<PublicPollPage />} /></Routes></MemoryRouter>);

  expect(screen.getByRole('radio', { name: /Set A/ }).querySelectorAll('img')).toHaveLength(3);
  expect(screen.getByRole('radio', { name: /Set B/ }).querySelectorAll('img')).toHaveLength(2);
  expect(screen.getByRole('img', { name: 'Món 3 của Set A' }).getAttribute('src')).toBe('/shoes.jpg');
});
