import type { StylePreferences } from '../../../interface/dto/types';

export type Style = NonNullable<StylePreferences['styles']>[number];

/** 12 phong cách, cùng nhãn với phong cách AI gán cho món đồ (outfit-service StylePreferences.STYLES). */
export const STYLES: { value: Style; label: string }[] = [
  { value: 'casual', label: 'Thường ngày' },
  { value: 'minimal', label: 'Tối giản' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'sporty', label: 'Năng động' },
  { value: 'office', label: 'Công sở' },
  { value: 'smart-casual', label: 'Lịch sự' },
  { value: 'elegant', label: 'Thanh lịch' },
  { value: 'feminine', label: 'Nữ tính' },
  { value: 'romantic', label: 'Dịu dàng' },
  { value: 'preppy', label: 'Preppy' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'trendy', label: 'Cá tính' },
];

/** 5 câu trắc nghiệm, mỗi câu chọn được nhiều đáp án; mỗi đáp án nghiêng về một phong cách. */
export const STYLE_QUIZ: { question: string; answers: { label: string; style: Style }[] }[] = [
  {
    question: 'Cuối tuần lý tưởng của bạn là…',
    answers: [
      { label: 'Đi phố, cà phê, chụp ảnh check-in', style: 'streetwear' },
      { label: 'Chạy bộ, đá bóng, leo núi', style: 'sporty' },
      { label: 'Ở nhà dọn dẹp, đọc sách', style: 'minimal' },
      { label: 'Lục chợ đồ cũ, nghe nhạc xưa', style: 'vintage' },
      { label: 'Đi ăn tối, xem triển lãm', style: 'elegant' },
      { label: 'Hẹn bạn bè đi dạo, picnic', style: 'casual' },
    ],
  },
  {
    question: 'Bạn bè hay nhận xét bạn là người…',
    answers: [
      { label: 'Dịu dàng, tinh tế', style: 'romantic' },
      { label: 'Chỉn chu, đáng tin', style: 'office' },
      { label: 'Cá tính, chất', style: 'trendy' },
      { label: 'Năng lượng, hoạt bát', style: 'sporty' },
      { label: 'Gọn gàng, chăm học', style: 'preppy' },
      { label: 'Dễ gần, thoải mái', style: 'casual' },
    ],
  },
  {
    question: 'Khi mở tủ đồ buổi sáng, bạn…',
    answers: [
      { label: 'Chọn món đơn giản, ít màu cho nhanh', style: 'minimal' },
      { label: 'Phối kỹ cho hợp buổi họp, buổi học', style: 'smart-casual' },
      { label: 'Thêm một món điểm nhấn hoài cổ', style: 'vintage' },
      { label: 'Chọn váy hoặc món mềm mại, bay bổng', style: 'feminine' },
      { label: 'Lấy hoodie, quần rộng cho thoải mái', style: 'streetwear' },
      { label: 'Thử món đang hot trên mạng', style: 'trendy' },
    ],
  },
  {
    question: 'Món đồ bạn sẵn sàng chi nhiều nhất là…',
    answers: [
      { label: 'Đôi sneaker hiếm', style: 'streetwear' },
      { label: 'Áo blazer may đẹp', style: 'office' },
      { label: 'Đồ tập thể thao tốt', style: 'sporty' },
      { label: 'Áo len, quần âu chất liệu tốt màu trung tính', style: 'minimal' },
      { label: 'Túi xách, trang sức tinh tế', style: 'elegant' },
      { label: 'Áo sơ mi kẻ, áo len cổ V kiểu học đường', style: 'preppy' },
    ],
  },
  {
    question: 'Bộ phim có phong cách bạn thích nhất…',
    answers: [
      { label: 'Phim tình cảm Hàn Quốc', style: 'romantic' },
      { label: 'Phim Hồng Kông thập niên 90', style: 'vintage' },
      { label: 'Phim hip-hop, đường phố', style: 'streetwear' },
      { label: 'Phim văn phòng, công sở', style: 'office' },
      { label: 'Phim học đường', style: 'preppy' },
      { label: 'Phim cổ tích, nàng thơ', style: 'feminine' },
    ],
  },
];

/** Tối đa 3 phong cách được chọn nhiều nhất trên mọi câu; câu chưa trả lời thì bỏ qua. */
export function quizStyles(answers: Style[][]): Style[] {
  const count = new Map<Style, number>();
  answers.flat().forEach((style) => count.set(style, (count.get(style) ?? 0) + 1));
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([style]) => style);
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
