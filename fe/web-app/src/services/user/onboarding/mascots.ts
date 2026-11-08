/** Stable IDs shared by the welcome flow and the illustration filenames. */
export const MASCOTS = [
  { id: 'cat', name: 'Mèo Mây', style: 'Tối giản' },
  { id: 'fox', name: 'Cáo Phố', style: 'Streetwear' },
  { id: 'rabbit', name: 'Thỏ Nơ', style: 'Nữ tính' },
  { id: 'bear', name: 'Gấu Sân', style: 'Thể thao' },
  { id: 'frog', name: 'Ếch Bụi', style: 'Vintage' },
  { id: 'penguin', name: 'Cánh Cụt', style: 'Preppy' },
] as const;

export type MascotId = (typeof MASCOTS)[number]['id'];

export function mascotImage(id: MascotId) {
  return `/illustrations/${id}.svg`;
}
