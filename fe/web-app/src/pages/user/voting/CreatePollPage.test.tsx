import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { CreatePollPage } from './CreatePollPage';

vi.mock('../../../hooks/user/voting/api', () => ({
  useOutfitChoices: () => ({ data: [
    { id: 'outfit-a', itemIds: ['shirt', 'pants'], occasion: 'HANGOUT', createdAt: '2026-11-09T00:00:00Z' },
    { id: 'outfit-b', itemIds: ['shirt', 'shoes'], occasion: 'SCHOOL', createdAt: '2026-11-09T00:00:00Z' },
  ], isPending: false }),
  useCreatePoll: () => ({ data: null, isPending: false, isError: false, mutate: vi.fn() }),
}));
vi.mock('../../../hooks/user/wardrobe/api', () => ({
  useWardrobe: () => ({ data: [
    { id: 'shirt', category: 'TOP', imageUrl: '/shirt.jpg' },
    { id: 'pants', category: 'BOTTOM', imageUrl: '/pants.jpg' },
    { id: 'shoes', category: 'SHOES', imageUrl: '/shoes.jpg' },
  ] }),
}));

afterEach(cleanup);

it('identifies saved outfits by occasion and pieces and previews every selected item', () => {
  render(<MemoryRouter initialEntries={['/polls/new?outfit=outfit-a']}><CreatePollPage /></MemoryRouter>);

  expect(within(screen.getByLabelText('Outfit A')).getByRole('option', { name: /Đi chơi · Áo \+ Quần/ })).toBeTruthy();
  expect(within(screen.getByLabelText('Outfit B')).getByRole('option', { name: /Đi học · Áo \+ Giày/ })).toBeTruthy();
  expect(screen.getByRole('img', { name: 'Áo trong outfit, món 1' }).getAttribute('src')).toBe('/shirt.jpg');
  expect(screen.getByRole('img', { name: 'Quần trong outfit, món 2' }).getAttribute('src')).toBe('/pants.jpg');
  fireEvent.change(screen.getByLabelText('Outfit B'), { target: { value: 'outfit-b' } });
  expect(screen.getByRole('img', { name: 'Giày trong outfit, món 2' }).getAttribute('src')).toBe('/shoes.jpg');
});
