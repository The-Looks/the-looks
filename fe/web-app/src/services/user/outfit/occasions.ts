import type { Occasion } from '../../../interface/dto/types';

export const OCCASIONS: { value: Occasion; label: string; hint: string }[] = [
  { value: 'SCHOOL', label: 'Đi học', hint: 'Thoải mái, năng động' },
  { value: 'WORK', label: 'Đi làm', hint: 'Lịch sự, gọn gàng' },
  { value: 'HANGOUT', label: 'Đi chơi', hint: 'Trẻ trung, cá tính' },
  { value: 'DATE', label: 'Hẹn hò', hint: 'Nữ tính, nổi bật' },
  { value: 'PARTY', label: 'Đi tiệc', hint: 'Nổi bật, cá tính' },
  { value: 'TRAVEL', label: 'Du lịch', hint: 'Thoải mái, dễ di chuyển' },
  { value: 'SPORT', label: 'Tập thể thao', hint: 'Năng động, thoáng mát' },
  { value: 'WEDDING', label: 'Dự tiệc cưới', hint: 'Thanh lịch, trang trọng' },
  { value: 'INTERVIEW', label: 'Phỏng vấn', hint: 'Chỉn chu, đáng tin' },
];

export const occasionLabel = (o?: Occasion) => OCCASIONS.find((x) => x.value === o)?.label;
