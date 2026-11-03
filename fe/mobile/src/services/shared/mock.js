import brand from '../../../../web-app/brand.json';

export const user = { name: 'Thảo Nguyên', city: 'TP.HCM', temp: '31°C', items: 68, rarely: 22, never: 12, height: 158, weight: 48, bust: 82, waist: 62, hip: 93, shape: 'Quả lê', palette: 'Warm Autumn' };

export const items = [
  { id: 1, name: 'Sơ mi croptop', cat: 'Áo', color: 'Trắng kem', emoji: '👚', tint: '#F6EBDD', worn: 8, price: 220000, src: 'Shopee' },
  { id: 2, name: 'Chân váy xếp ly', cat: 'Váy', color: 'Hồng pastel', emoji: '👗', tint: '#F7D9DD', worn: 5, price: 280000, src: 'TikTok Shop' },
  { id: 3, name: 'Blazer pastel', cat: 'Áo khoác', color: 'Lavender', emoji: '🧥', tint: '#E4D5F7', worn: 3, price: 520000, src: 'Shopee' },
  { id: 4, name: 'Quần jean rộng', cat: 'Quần', color: 'Xanh denim', emoji: '👖', tint: '#D6E3F2', worn: 12, price: 330000, src: 'Shopee' },
  { id: 5, name: 'Áo cardigan tím pastel', cat: 'Áo khoác', color: 'Tím pastel', emoji: '🧶', tint: '#E4D5F7', worn: 0, price: 350000, src: 'TikTok Shop' },
  { id: 6, name: 'Giày sneaker trắng', cat: 'Giày', color: 'Trắng', emoji: '👟', tint: '#EFEFF4', worn: 20, price: 650000, src: 'Shopee' },
];

export const outfits = [
  { id: 1, name: 'Pastel Cafe Layering', occasion: 'Cafe', count: 4, match: 96, emojis: ['👚', '👗', '🧥', '👟'], tint: '#F1E7FA' },
  { id: 2, name: 'Soft Campus Day', occasion: 'Đi học', count: 3, match: 92, emojis: ['👚', '👖', '👟'], tint: '#F7D9DD' },
  { id: 3, name: 'Weekend Picnic', occasion: 'Dã ngoại', count: 3, match: 88, emojis: ['👗', '🧶', '👟'], tint: '#C9D8C5' },
];

export const polls = [
  { id: 1, title: 'Set nào hợp buổi hẹn?', votes: 18, a: 67, b: 33, left: '8 giờ', status: 'Đang mở' },
  { id: 2, title: 'Outfit đi cafe cuối tuần', votes: 24, a: 42, b: 58, left: 'Đã kết thúc', status: 'Đã đóng' },
];

export const comments = [
  { id: 1, who: 'Lan Anh', text: 'Set A nhìn nữ tính hơn, hợp đi hẹn nè!', time: '10 phút trước' },
  { id: 2, who: 'Minh Châu', text: 'Mình thích Set B, màu pastel dễ thương.', time: '25 phút trước' },
  { id: 3, who: 'Hà My', text: 'Thêm túi nhỏ màu tím nữa là đẹp 💜', time: '1 giờ trước' },
];

export const notifications = [
  { id: 1, icon: '🗳️', title: 'Lan Anh đã bình chọn Set A', time: '5 phút trước' },
  { id: 2, icon: '☀️', title: 'Hôm nay 31°C · gợi ý outfit thoáng mát', time: '1 giờ trước' },
  { id: 3, icon: '👗', title: '12 món chưa mặc lần nào, thử phối lại?', time: 'Hôm qua' },
];

export const styles = ['Nữ tính', 'Năng động', 'Tối giản', 'Streetwear', 'Vintage', 'Công sở'];
export const palette = [brand.colors.purple, brand.colors.pink, brand.colors.lavender, brand.colors.cream, brand.colors.sage, '#D6E3F2', brand.colors.ink, brand.colors.white];
export const cats = ['Tất cả', 'Áo', 'Quần', 'Váy', 'Áo khoác', 'Giày', 'Phụ kiện'];
export const vnd = (n) => n.toLocaleString('vi-VN') + 'đ';
