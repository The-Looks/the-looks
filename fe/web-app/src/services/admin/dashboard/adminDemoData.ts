/** Preview data for Figma admin screens. No admin write API exists yet. */
export type AdminUser = {
  key: string; name: string; email: string; joined: string; activity: string;
  status: 'Hoạt động' | 'Chờ xác minh' | 'Tạm khóa'; wardrobe: number; outfits: number; polls: number;
};

export const adminUsers: AdminUser[] = [
  { key: '1', name: 'Nguyễn Thảo Nguyên', email: 'thao.nguyen@example.com', joined: '14/10/2026', activity: 'Hôm nay', status: 'Hoạt động', wardrobe: 68, outfits: 22, polls: 12 },
  { key: '2', name: 'Trần Minh Anh', email: 'minh.anh@example.com', joined: '12/10/2026', activity: 'Hôm nay', status: 'Hoạt động', wardrobe: 35, outfits: 14, polls: 5 },
  { key: '3', name: 'Lê Gia Hân', email: 'gia.han@example.com', joined: '10/10/2026', activity: 'Hôm qua', status: 'Chờ xác minh', wardrobe: 16, outfits: 4, polls: 1 },
  { key: '4', name: 'Phạm Khánh Linh', email: 'khanh.linh@example.com', joined: '08/10/2026', activity: '2 ngày trước', status: 'Hoạt động', wardrobe: 42, outfits: 17, polls: 8 },
  { key: '5', name: 'Vũ Hoàng Mai', email: 'hoang.mai@example.com', joined: '03/10/2026', activity: '3 ngày trước', status: 'Tạm khóa', wardrobe: 23, outfits: 9, polls: 2 },
  { key: '6', name: 'Đỗ Bảo Trân', email: 'bao.tran@example.com', joined: '30/09/2026', activity: 'Hôm qua', status: 'Hoạt động', wardrobe: 55, outfits: 23, polls: 11 },
  { key: '7', name: 'Hoàng Gia Bảo', email: 'gia.bao@example.com', joined: '23/09/2026', activity: '3 ngày trước', status: 'Hoạt động', wardrobe: 29, outfits: 6, polls: 3 },
  { key: '8', name: 'Ngô Phương Vy', email: 'phuong.vy@example.com', joined: '18/09/2026', activity: 'Hôm nay', status: 'Chờ xác minh', wardrobe: 18, outfits: 3, polls: 0 },
];

export type AdminReport = { key: string; type: string; title: string; reporter: string; time: string; priority: 'Cao' | 'Trung bình' | 'Thấp' };
export const adminReports: AdminReport[] = [
  { key: '1', type: 'Bình chọn', title: 'Set nào hợp buổi hẹn cuối tuần?', reporter: 'Thảo Nguyên', time: '14/10 · 09:50', priority: 'Cao' },
  { key: '2', type: 'Bình luận', title: 'Bình luận bị báo cáo trong bình chọn', reporter: 'Minh Anh', time: '14/10 · 09:07', priority: 'Cao' },
  { key: '3', type: 'Bình chọn', title: 'Outfit đi học ngày mưa', reporter: 'Gia Hân', time: '13/10 · 16:42', priority: 'Trung bình' },
  { key: '4', type: 'Bài viết', title: 'Hình ảnh không phù hợp', reporter: 'Khánh Linh', time: '12/10 · 11:05', priority: 'Cao' },
  { key: '5', type: 'Bình luận', title: 'Nội dung quảng cáo lặp lại', reporter: 'Bảo Trân', time: '12/10 · 07:35', priority: 'Thấp' },
];

export type AdminProduct = { key: string; name: string; source: string; price: string; category: string; status: 'Hiển thị' | 'Chờ duyệt' | 'Cần sửa' };
export const adminProducts: AdminProduct[] = [
  { key: '1', name: 'Áo cardigan lilac', source: 'Shopee', price: '189.000đ', category: 'Áo', status: 'Hiển thị' },
  { key: '2', name: 'Chân váy xếp ly pastel', source: 'TikTok Shop', price: '245.000đ', category: 'Váy', status: 'Hiển thị' },
  { key: '3', name: 'Blazer pastel nhẹ', source: 'Shopee', price: '540.000đ', category: 'Áo khoác', status: 'Hiển thị' },
  { key: '4', name: 'Túi baguette màu kem', source: 'Shopee', price: '199.000đ', category: 'Phụ kiện', status: 'Chờ duyệt' },
  { key: '5', name: 'Quần jean ống rộng', source: 'TikTok Shop', price: '329.000đ', category: 'Quần', status: 'Cần sửa' },
  { key: '6', name: 'Giày Mary Jane pastel', source: 'Shopee', price: '299.000đ', category: 'Giày', status: 'Hiển thị' },
];

export const adminAudit = [
  { key: '1', time: '14/10/2026 · 10:45', actor: 'Admin THE LOOKS', action: 'Mở khóa tài khoản', target: 'Vũ Hoàng Mai', result: 'Thành công' },
  { key: '2', time: '14/10/2026 · 09:52', actor: 'Admin THE LOOKS', action: 'Xác minh tài khoản', target: 'Lê Gia Hân', result: 'Thành công' },
  { key: '3', time: '13/10/2026 · 17:05', actor: 'Admin THE LOOKS', action: 'Khóa tài khoản', target: 'Lê Hoàng Mai', result: 'Thành công' },
  { key: '4', time: '13/10/2026 · 15:22', actor: 'Admin THE LOOKS', action: 'Gỡ thông báo', target: 'Trần Minh Anh', result: 'Thành công' },
  { key: '5', time: '12/10/2026 · 15:12', actor: 'Admin THE LOOKS', action: 'Cập nhật trạng thái', target: 'Ngô Phương Vy', result: 'Thành công' },
];
