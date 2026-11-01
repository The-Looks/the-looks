// Nhãn tiếng Việt cho các giá trị enum trong contract (be/packages/contracts).

export const CATEGORY_LABEL: Record<string, string> = {
  TOP: 'Áo',
  BOTTOM: 'Quần',
  DRESS: 'Váy',
  OUTERWEAR: 'Áo khoác',
  SHOES: 'Giày',
  BAG: 'Túi',
  ACCESSORY: 'Phụ kiện',
};

/** Ảnh thay thế khi món đồ chưa có ảnh (giống bản prototype). */
export const CATEGORY_EMOJI: Record<string, string> = {
  TOP: '👚',
  BOTTOM: '👖',
  DRESS: '👗',
  OUTERWEAR: '🧥',
  SHOES: '👟',
  BAG: '👜',
  ACCESSORY: '💍',
};

export const categoryLabel = (c?: string) => (c && CATEGORY_LABEL[c.toUpperCase()]) || 'Món đồ';
