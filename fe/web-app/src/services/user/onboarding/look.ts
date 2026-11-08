import { MASCOTS, type MascotId } from './mascots';

/** Phụ kiện gắn lên linh vật, kiểu tạo nhân vật trong game: mỗi chỗ một món, có thể để trống. */
export type Slot = 'hat' | 'glasses' | 'neck' | 'background';

export type Look = {
  mascot: MascotId;
  hat?: string;
  glasses?: string;
  neck?: string;
  background?: string;
};

export const ACCESSORIES: Record<Slot, { id: string; name: string; color?: string }[]> = {
  hat: [
    { id: 'beanie', name: 'Mũ len' },
    { id: 'cap', name: 'Mũ lưỡi trai' },
    { id: 'bucket', name: 'Mũ tai bèo' },
    { id: 'beret', name: 'Mũ nồi' },
    { id: 'crown', name: 'Vương miện' },
    { id: 'flowers', name: 'Băng đô hoa' },
  ],
  glasses: [
    { id: 'round', name: 'Kính tròn' },
    { id: 'sunglasses', name: 'Kính râm' },
    { id: 'heart', name: 'Kính trái tim' },
    { id: 'star', name: 'Kính ngôi sao' },
  ],
  neck: [
    { id: 'scarf', name: 'Khăn len' },
    { id: 'bowtie', name: 'Nơ cổ' },
    { id: 'pearls', name: 'Vòng ngọc trai' },
    { id: 'bandana', name: 'Khăn bandana' },
  ],
  background: [
    { id: 'lavender', name: 'Tím nhạt', color: '#ece4fb' },
    { id: 'mint', name: 'Xanh bạc hà', color: '#dcf1e4' },
    { id: 'sky', name: 'Xanh trời', color: '#dbeafb' },
    { id: 'peach', name: 'Cam đào', color: '#fde3d3' },
    { id: 'lemon', name: 'Vàng chanh', color: '#faf1c4' },
    { id: 'blush', name: 'Hồng phấn', color: '#fadbe6' },
  ],
};

export const SLOTS: Slot[] = ['hat', 'glasses', 'neck', 'background'];

const isMascot = (id: unknown): id is MascotId => MASCOTS.some((m) => m.id === id);
const known = (slot: Slot, id: unknown) => typeof id === 'string' && ACCESSORIES[slot].some((a) => a.id === id) ? id : undefined;

/** Bỏ mọi giá trị lạ (dữ liệu cũ, sửa tay trong trình duyệt). */
export function normalizeLook(raw: unknown): Look | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  if (!isMascot(r.mascot)) return undefined;
  const look: Look = { mascot: r.mascot };
  for (const slot of SLOTS) {
    const id = known(slot, r[slot]);
    if (id) look[slot] = id;
  }
  return look;
}

/** Chuỗi gọn để lưu lên hồ sơ server sau này, vd "fox|hat:cap|glasses:round". */
export function encodeLook(look: Look): string {
  return [look.mascot, ...SLOTS.filter((s) => look[s]).map((s) => `${s}:${look[s]}`)].join('|');
}

export function decodeLook(text: string): Look | undefined {
  const [mascot, ...parts] = text.split('|');
  return normalizeLook({ mascot, ...Object.fromEntries(parts.map((p) => p.split(':'))) });
}

/** Nút ngẫu nhiên: mỗi chỗ có khoảng 1/3 cơ hội để trống cho đỡ rối. */
export function randomLook(random: () => number = Math.random): Look {
  const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)]!;
  const look: Look = { mascot: pick(MASCOTS).id };
  for (const slot of SLOTS) {
    if (random() < 0.67) look[slot] = pick(ACCESSORIES[slot]).id;
  }
  return look;
}

export function backgroundColor(look: Look) {
  return ACCESSORIES.background.find((b) => b.id === look.background)?.color;
}
