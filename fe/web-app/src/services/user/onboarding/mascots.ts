/**
 * Stable IDs shared by the welcome flow and the illustration filenames.
 * 6 con đầu là hình vẽ sẵn (có trang phục riêng, public/illustrations); các con còn lại là linh vật "tự phối"
 * dùng chung dáng người nên mặc được áo / quần / giày (components/user/mascot/ModularMascot).
 */
export const MASCOTS = [
  { id: 'cat', name: 'Mèo Mây', style: 'Tối giản' },
  { id: 'fox', name: 'Cáo Phố', style: 'Streetwear' },
  { id: 'rabbit', name: 'Thỏ Nơ', style: 'Nữ tính' },
  { id: 'bear', name: 'Gấu Sân', style: 'Thể thao' },
  { id: 'frog', name: 'Ếch Bụi', style: 'Vintage' },
  { id: 'penguin', name: 'Cánh Cụt', style: 'Preppy' },
  { id: 'dog', name: 'Cún Bông', style: 'Tự phối' },
  { id: 'panda', name: 'Trúc Mập', style: 'Tự phối' },
  { id: 'tiger', name: 'Hổ Vằn', style: 'Tự phối' },
  { id: 'koala', name: 'Túi Mơ', style: 'Tự phối' },
  { id: 'pig', name: 'Heo Hồng', style: 'Tự phối' },
  { id: 'duck', name: 'Vịt Vàng', style: 'Tự phối' },
  { id: 'hamster', name: 'Chuột Bánh', style: 'Tự phối' },
  { id: 'raccoon', name: 'Mặt Nạ', style: 'Tự phối' },
  { id: 'lion', name: 'Sư Tử Nắng', style: 'Tự phối' },
  { id: 'monkey', name: 'Khỉ Nhí', style: 'Tự phối' },
] as const;

export type MascotId = (typeof MASCOTS)[number]['id'];

export const MODULAR_IDS = ['dog', 'panda', 'tiger', 'koala', 'pig', 'duck', 'hamster', 'raccoon', 'lion', 'monkey'] as const;
export type ModularId = (typeof MODULAR_IDS)[number];
export const isModular = (id: MascotId): id is ModularId => (MODULAR_IDS as readonly string[]).includes(id);

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

/** Linh vật tự phối dùng chung một dáng: đầu tâm (160, 84). */
const MODULAR: Anchor = { hat: { x: 160, y: 56, w: 82 }, eyes: { x: 160, y: 84, d: 30 }, neck: { x: 160, y: 124, w: 46 }, portrait: [98, 24, 124] };

export const ANCHORS: Record<MascotId, Anchor> = {
  cat: { hat: { x: 160, y: 64, w: 68 }, eyes: { x: 160, y: 80, d: 26 }, neck: { x: 160, y: 104, w: 44 }, portrait: [97, 11, 126] },
  fox: { hat: { x: 160, y: 72, w: 70 }, eyes: { x: 160, y: 83, d: 30 }, neck: { x: 160, y: 113, w: 40 }, portrait: [104, 19, 112] },
  rabbit: { hat: { x: 160, y: 66, w: 62 }, eyes: { x: 160, y: 86, d: 30 }, neck: { x: 160, y: 117, w: 36 }, portrait: [94, -2, 132] },
  bear: { hat: { x: 160, y: 72, w: 74 }, eyes: { x: 160, y: 80, d: 32 }, neck: { x: 160, y: 116, w: 44 }, portrait: [99, 21, 122] },
  frog: { hat: { x: 160, y: 50, w: 80 }, eyes: { x: 160, y: 62, d: 48 }, neck: { x: 160, y: 114, w: 48 }, portrait: [107, 12, 120] },
  penguin: { hat: { x: 160, y: 50, w: 52 }, eyes: { x: 160, y: 76, d: 24 }, neck: { x: 160, y: 112, w: 40 }, portrait: [110, 28, 100] },
  dog: MODULAR, panda: MODULAR, tiger: MODULAR, koala: MODULAR, pig: MODULAR,
  duck: MODULAR, hamster: MODULAR, raccoon: MODULAR, lion: { ...MODULAR, hat: { x: 160, y: 50, w: 90 } }, monkey: MODULAR,
};
