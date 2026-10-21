// Dữ liệu minh họa theo wireframe Figma. Thay bằng API Spring Boot khi có backend.

export const initialUsers = [
  { id: 'USR-1028', name: 'Nguyễn Thảo Nguyên', email: 'thao.nguyen@example.com', joined: '14/10/2026', lastActive: 'Hôm nay', status: 'Hoạt động' },
  { id: 'USR-1027', name: 'Trần Minh Anh', email: 'minh.anh@example.com', joined: '12/10/2026', lastActive: 'Hôm nay', status: 'Hoạt động' },
  { id: 'USR-1026', name: 'Lê Gia Hân', email: 'gia.han@example.com', joined: '09/10/2026', lastActive: 'Hôm qua', status: 'Chờ xác minh' },
  { id: 'USR-1025', name: 'Phạm Khánh Linh', email: 'khanh.linh@example.com', joined: '04/10/2026', lastActive: '2 ngày trước', status: 'Hoạt động' },
  { id: 'USR-1024', name: 'Vũ Hoàng Mai', email: 'hoang.mai@example.com', joined: '01/10/2026', lastActive: '5 ngày trước', status: 'Tạm khóa' },
  { id: 'USR-1023', name: 'Đỗ Bảo Trân', email: 'bao.tran@example.com', joined: '28/09/2026', lastActive: 'Hôm qua', status: 'Hoạt động' },
  { id: 'USR-1022', name: 'Hoàng Gia Bảo', email: 'gia.bao@example.com', joined: '21/09/2026', lastActive: '3 ngày trước', status: 'Hoạt động' },
  { id: 'USR-1021', name: 'Ngô Phương Vy', email: 'phuong.vy@example.com', joined: '19/09/2026', lastActive: 'Hôm nay', status: 'Chờ xác minh' },
];

export const initialAudit = [
  { time: '14/10/2026 · 10:48', admin: 'Admin LOOKSY', action: 'Mở khóa tài khoản', user: 'Vũ Hoàng Mai', result: 'Thành công' },
  { time: '14/10/2026 · 09:32', admin: 'Admin LOOKSY', action: 'Xác minh tài khoản', user: 'Lê Gia Hân', result: 'Thành công' },
  { time: '13/10/2026 · 16:05', admin: 'Admin LOOKSY', action: 'Khóa tài khoản', user: 'Vũ Hoàng Mai', result: 'Thành công' },
  { time: '13/10/2026 · 11:20', admin: 'Admin LOOKSY', action: 'Gửi thông báo', user: 'Trần Minh Anh', result: 'Thành công' },
  { time: '12/10/2026 · 15:12', admin: 'Admin LOOKSY', action: 'Cập nhật trạng thái', user: 'Ngô Phương Vy', result: 'Thành công' },
  { time: '11/10/2026 · 14:08', admin: 'Admin LOOKSY', action: 'Xác minh tài khoản', user: 'Đỗ Bảo Trân', result: 'Thành công' },
  { time: '10/10/2026 · 08:45', admin: 'Admin LOOKSY', action: 'Gửi thông báo', user: 'Nguyễn Thảo Nguyên', result: 'Thành công' },
];

export const initialContent = [
  { id: 1, type: 'Bình chọn', summary: 'Set nào hợp buổi hẹn cuối tuần?', author: 'Thảo Nguyên', time: '14/10 · 09:30', priority: 'Cao' },
  { id: 2, type: 'Bình luận', summary: 'Bình luận bị báo cáo trong bình chọn', author: 'Minh Anh', time: '14/10 · 08:17', priority: 'Cao' },
  { id: 3, type: 'Bình chọn', summary: 'Outfit đi học ngày mưa', author: 'Gia Hân', time: '13/10 · 18:42', priority: 'Trung bình' },
  { id: 4, type: 'Báo cáo', summary: 'Hình ảnh không phù hợp', author: 'Khánh Linh', time: '13/10 · 16:10', priority: 'Cao' },
  { id: 5, type: 'Bình luận', summary: 'Nội dung quảng cáo lặp lại', author: 'Bảo Trân', time: '12/10 · 11:05', priority: 'Thấp' },
  { id: 6, type: 'Bình chọn', summary: 'Chọn blazer cho thứ hai', author: 'Phương Vy', time: '12/10 · 09:54', priority: 'Trung bình' },
];

export const initialProducts = [
  { id: 1, name: 'Áo cardigan lilac', source: 'Shopee', price: 189000, category: 'Áo', status: 'Hiển thị' },
  { id: 2, name: 'Chân váy xếp ly pastel', source: 'TikTok Shop', price: 245000, category: 'Váy', status: 'Hiển thị' },
  { id: 3, name: 'Blazer pastel nhẹ', source: 'Shopee', price: 540000, category: 'Áo khoác', status: 'Hiển thị' },
  { id: 4, name: 'Túi baguette màu kem', source: 'Shopee', price: 199000, category: 'Phụ kiện', status: 'Chờ duyệt' },
  { id: 5, name: 'Quần jean ống rộng', source: 'TikTok Shop', price: 329000, category: 'Quần', status: 'Cần sửa' },
  { id: 6, name: 'Giày Mary Jane pastel', source: 'Shopee', price: 299000, category: 'Giày', status: 'Hiển thị' },
];

export const initialCampaigns = [
  { id: 1, title: 'Gợi ý outfit cuối tuần', audience: 'Tất cả User', schedule: '14/10 · 18:00', creator: 'Admin LOOKSY', status: 'Lên lịch' },
  { id: 2, title: 'Cập nhật tính năng tủ đồ', audience: 'Tất cả User', schedule: '13/10 · 09:00', creator: 'Admin LOOKSY', status: 'Đã gửi' },
  { id: 3, title: 'Đơn hàng đã đồng bộ', audience: 'User có kết nối', schedule: '12/10 · 08:30', creator: 'Admin LOOKSY', status: 'Đã gửi' },
  { id: 4, title: 'Bình chọn mới từ bạn bè', audience: 'User tương tác', schedule: '11/10 · 19:00', creator: 'Admin LOOKSY', status: 'Đã gửi' },
  { id: 5, title: 'Chào mừng thành viên mới', audience: 'User mới', schedule: 'Chưa đặt lịch', creator: 'Admin LOOKSY', status: 'Bản nháp' },
];

export const syncIssues = [
  { source: 'Shopee', issue: 'Ảnh sản phẩm không tải được', impact: '12 sản phẩm', found: '14/10 · 10:21', level: 'Trung bình' },
  { source: 'TikTok Shop', issue: 'Giá bán thay đổi so với bản lưu', impact: '7 sản phẩm', found: '14/10 · 09:54', level: 'Thấp' },
  { source: 'Shopee', issue: 'Danh mục chưa được ánh xạ', impact: '4 sản phẩm', found: '13/10 · 17:08', level: 'Trung bình' },
];

export const transactions = [
  { code: 'SUB-1048', plan: 'LOOKSY Premium', date: '14/10/2026', amount: '149.000đ', status: 'Thành công' },
  { code: 'SUB-1047', plan: 'LOOKSY Plus', date: '14/10/2026', amount: '79.000đ', status: 'Chờ xử lý' },
  { code: 'SUB-1046', plan: 'LOOKSY Plus', date: '13/10/2026', amount: '79.000đ', status: 'Thành công' },
];

export const reconciliation = [
  { source: 'Shopee', period: '01–14/10/2026', orders: 248, commission: '5.220.000đ', status: 'Đã đối soát' },
  { source: 'TikTok Shop', period: '01–14/10/2026', orders: 164, commission: '3.200.000đ', status: 'Chờ đối soát' },
  { source: 'Shopee', period: '16–30/09/2026', orders: 221, commission: '4.780.000đ', status: 'Đã thanh toán' },
];

export const userActivity = [
  { time: 'Hôm nay, 09:42', text: 'Đăng nhập từ ứng dụng' },
  { time: '13/10/2026', text: 'Tạo outfit mới' },
  { time: '12/10/2026', text: 'Tham gia bình chọn' },
  { time: '10/10/2026', text: 'Xác minh email' },
];

export const weeklySignups = [
  { label: 'T2', value: 28 },
  { label: 'T3', value: 36 },
  { label: 'T4', value: 41 },
  { label: 'T5', value: 38 },
  { label: 'T6', value: 47 },
  { label: 'T7', value: 54 },
  { label: 'CN', value: 68 },
];

export const revenueTrend = [
  { label: 'T5', value: 14 },
  { label: 'T6', value: 17 },
  { label: 'T7', value: 19 },
  { label: 'T8', value: 22 },
  { label: 'T9', value: 24 },
  { label: 'T10', value: 28.65 },
];
