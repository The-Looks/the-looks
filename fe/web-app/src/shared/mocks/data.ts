import type { WardrobeItem } from '../api/types';

// Tủ đồ mẫu. ID trùng với FakeWardrobeReader của outfit-service (profile "demo"),
// để gợi ý từ outfit-service thật khớp với tủ đồ giả lập ở frontend.
const id = (n: number) => `00000000-0000-4000-8000-0000000000${String(n).padStart(2, '0')}`;
const createdAt = '2026-10-20T08:00:00Z';

export const sampleCloset: WardrobeItem[] = [
  { id: id(1), status: 'CONFIRMED', category: 'TOP', colors: ['white'], material: 'cotton', seasons: [], styleTags: ['formal', 'office', 'minimal'], createdAt },
  { id: id(2), status: 'CONFIRMED', category: 'TOP', colors: ['cream'], material: 'linen', seasons: [], styleTags: ['casual', 'feminine'], createdAt },
  { id: id(3), status: 'CONFIRMED', category: 'TOP', colors: ['black'], material: 'cotton', seasons: [], styleTags: ['casual', 'streetwear', 'basic'], createdAt },
  { id: id(4), status: 'CONFIRMED', category: 'BOTTOM', colors: ['denim'], material: 'denim', seasons: [], styleTags: ['casual', 'streetwear'], createdAt },
  { id: id(5), status: 'CONFIRMED', category: 'BOTTOM', colors: ['black'], material: 'polyester', seasons: [], styleTags: ['office', 'formal'], createdAt },
  { id: id(6), status: 'CONFIRMED', category: 'BOTTOM', colors: ['pink'], material: 'chiffon', seasons: [], styleTags: ['feminine', 'romantic', 'preppy'], createdAt },
  { id: id(7), status: 'CONFIRMED', category: 'DRESS', colors: ['lavender'], material: 'satin', seasons: [], styleTags: ['romantic', 'elegant', 'feminine'], createdAt },
  { id: id(8), status: 'CONFIRMED', category: 'SHOES', colors: ['white'], material: 'canvas', seasons: [], styleTags: ['casual', 'sporty'], createdAt },
  { id: id(9), status: 'CONFIRMED', category: 'SHOES', colors: ['brown'], material: 'leather', seasons: [], styleTags: ['formal', 'office'], createdAt },
  { id: id(10), status: 'CONFIRMED', category: 'OUTERWEAR', colors: ['lavender'], material: 'wool', seasons: [], styleTags: ['office', 'smart-casual'], createdAt },
];

export const DEMO_USER = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'demo@thelooks.vn',
  displayName: 'Thảo Nguyên',
  role: 'USER' as const,
  createdAt: '2026-10-01T08:00:00Z',
};
