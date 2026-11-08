import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, expect, it } from 'vitest';
import type { Look } from '../../../services/user/onboarding/look';
import { MascotEditor } from './MascotEditor';

afterEach(cleanup);

function Harness({ start }: { start: Look }) {
  const [look, setLook] = useState(start);
  return <><MascotEditor value={look} onChange={setLook} /><output>{JSON.stringify(look)}</output></>;
}

it('dresses a mix-and-match mascot', () => {
  render(<Harness start={{ mascot: 'dog' }} />);
  fireEvent.click(screen.getByRole('tab', { name: 'Áo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Hoodie' }));
  fireEvent.click(screen.getByRole('tab', { name: 'Giày' }));
  fireEvent.click(screen.getByRole('button', { name: 'Bốt' }));
  expect(JSON.parse(screen.getByRole('status').textContent!)).toEqual({ mascot: 'dog', top: 'hoodie', shoes: 'boots' });
});

it('swaps the drawn outfit of an original mascot for picked clothes', () => {
  render(<Harness start={{ mascot: 'fox' }} />);
  fireEvent.click(screen.getByRole('tab', { name: 'Áo' }));
  expect(screen.getByText(/thay bộ đồ gốc của Cáo Phố/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Hoodie' }));
  expect(JSON.parse(screen.getByRole('status').textContent!)).toEqual({ mascot: 'fox', top: 'hoodie' });
});
