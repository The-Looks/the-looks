import type { StylePreferences } from '../../../interface/dto/types';

export type Style = NonNullable<StylePreferences['styles']>[number];

/** 5 câu trắc nghiệm tính cách; mỗi đáp án nghiêng về một phong cách. */
export const STYLE_QUIZ: { question: string; answers: { label: string; style: Style }[] }[] = [
  {
    question: 'Cuối tuần lý tưởng của bạn là…',
    answers: [
      { label: 'Đi phố, cà phê, chụp ảnh check-in', style: 'streetwear' },
      { label: 'Chạy bộ, đá bóng, leo núi', style: 'sporty' },
      { label: 'Ở nhà dọn dẹp, đọc sách', style: 'minimal' },
      { label: 'Lục chợ đồ cũ, nghe nhạc xưa', style: 'vintage' },
    ],
  },
  {
    question: 'Bạn bè hay nhận xét bạn là người…',
    answers: [
      { label: 'Dịu dàng, tinh tế', style: 'feminine' },
      { label: 'Chỉn chu, đáng tin', style: 'office' },
      { label: 'Cá tính, chất', style: 'streetwear' },
      { label: 'Năng lượng, hoạt bát', style: 'sporty' },
    ],
  },
  {
    question: 'Khi mở tủ đồ buổi sáng, bạn…',
    answers: [
      { label: 'Chọn món đơn giản, ít màu cho nhanh', style: 'minimal' },
      { label: 'Phối kỹ cho hợp buổi họp, buổi học', style: 'office' },
      { label: 'Thêm một món điểm nhấn hoài cổ', style: 'vintage' },
      { label: 'Chọn váy hoặc món mềm mại, bay bổng', style: 'feminine' },
    ],
  },
  {
    question: 'Món đồ bạn sẵn sàng chi nhiều nhất là…',
    answers: [
      { label: 'Đôi sneaker hiếm', style: 'streetwear' },
      { label: 'Áo blazer may đẹp', style: 'office' },
      { label: 'Đồ tập thể thao tốt', style: 'sporty' },
      { label: 'Áo len, quần âu chất liệu tốt màu trung tính', style: 'minimal' },
    ],
  },
  {
    question: 'Bộ phim có phong cách bạn thích nhất…',
    answers: [
      { label: 'Phim tình cảm Hàn Quốc', style: 'feminine' },
      { label: 'Phim Hồng Kông thập niên 90', style: 'vintage' },
      { label: 'Phim hip-hop, đường phố', style: 'streetwear' },
      { label: 'Phim văn phòng, công sở', style: 'office' },
    ],
  },
];

/** 2 phong cách được chọn nhiều nhất; câu chưa trả lời thì bỏ qua. */
export function quizStyles(answers: (Style | undefined)[]): Style[] {
  const count = new Map<Style, number>();
  answers.forEach((style) => style && count.set(style, (count.get(style) ?? 0) + 1));
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([style]) => style);
}

/** Nhãn màu giống nhãn AI gán cho món đồ, để so được với tủ đồ. */
export const COLORS: { value: string; label: string; swatch: string }[] = [
  { value: 'white', label: 'Trắng', swatch: '#ffffff' },
  { value: 'black', label: 'Đen', swatch: '#1f1f1f' },
  { value: 'beige', label: 'Be', swatch: '#e8d9bf' },
  { value: 'gray', label: 'Xám', swatch: '#9e9e9e' },
  { value: 'navy', label: 'Xanh navy', swatch: '#1f2f5c' },
  { value: 'blue', label: 'Xanh dương', swatch: '#4a7bd0' },
  { value: 'brown', label: 'Nâu', swatch: '#7a5236' },
  { value: 'pink', label: 'Hồng', swatch: '#f2a7c3' },
  { value: 'red', label: 'Đỏ', swatch: '#d0342c' },
  { value: 'green', label: 'Xanh lá', swatch: '#4d8b55' },
];
