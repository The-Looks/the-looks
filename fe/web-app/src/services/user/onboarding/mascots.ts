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

/**
 * Chỗ gắn phụ kiện trên hình 320×320 của từng linh vật: đáy mũ (x, y, rộng), giữa hai mắt (x, y, khoảng cách
 * hai mắt), cổ áo (x, y, rộng). portrait = khung cắt quanh đầu dùng cho ảnh đại diện [x, y, cạnh].
 */
export type Anchor = {
  hat: { x: number; y: number; w: number };
  eyes: { x: number; y: number; d: number };
  neck: { x: number; y: number; w: number };
  portrait: [number, number, number];
};

export const ANCHORS: Record<MascotId, Anchor> = {
  cat: { hat: { x: 160, y: 64, w: 68 }, eyes: { x: 160, y: 80, d: 26 }, neck: { x: 160, y: 104, w: 44 }, portrait: [97, 11, 126] },
  fox: { hat: { x: 160, y: 72, w: 70 }, eyes: { x: 160, y: 83, d: 30 }, neck: { x: 160, y: 113, w: 40 }, portrait: [104, 19, 112] },
  rabbit: { hat: { x: 160, y: 66, w: 62 }, eyes: { x: 160, y: 86, d: 30 }, neck: { x: 160, y: 117, w: 36 }, portrait: [94, -2, 132] },
  bear: { hat: { x: 160, y: 72, w: 74 }, eyes: { x: 160, y: 80, d: 32 }, neck: { x: 160, y: 116, w: 44 }, portrait: [99, 21, 122] },
  frog: { hat: { x: 160, y: 50, w: 80 }, eyes: { x: 160, y: 62, d: 48 }, neck: { x: 160, y: 114, w: 48 }, portrait: [107, 12, 120] },
  penguin: { hat: { x: 160, y: 50, w: 52 }, eyes: { x: 160, y: 76, d: 24 }, neck: { x: 160, y: 112, w: 40 }, portrait: [110, 28, 100] },
};
