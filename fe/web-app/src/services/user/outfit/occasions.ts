import type { Occasion } from '../../../interface/dto/types';

export const OCCASIONS: { value: Occasion; label: string; hint: string }[] = [
  { value: 'SCHOOL', label: 'Đi học', hint: 'Thoải mái, năng động' },
  { value: 'WORK', label: 'Đi làm', hint: 'Lịch sự, gọn gàng' },
  { value: 'HANGOUT', label: 'Đi chơi', hint: 'Trẻ trung, cá tính' },
  { value: 'DATE', label: 'Hẹn hò', hint: 'Nữ tính, nổi bật' },
];

export const occasionLabel = (o?: Occasion) => OCCASIONS.find((x) => x.value === o)?.label;
