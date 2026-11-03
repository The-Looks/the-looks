import type { Occasion } from '../../../interface/dto/types';

export const OCCASIONS: { value: Occasion; label: string; hint: string; icon: string }[] = [
  { value: 'SCHOOL', label: 'Đi học', hint: 'Thoải mái, năng động', icon: '🎒' },
  { value: 'WORK', label: 'Đi làm', hint: 'Lịch sự, gọn gàng', icon: '💼' },
  { value: 'HANGOUT', label: 'Đi chơi', hint: 'Trẻ trung, cá tính', icon: '🎡' },
  { value: 'DATE', label: 'Hẹn hò', hint: 'Nữ tính, nổi bật', icon: '💕' },
];

export const occasionLabel = (o?: Occasion) => OCCASIONS.find((x) => x.value === o)?.label;
