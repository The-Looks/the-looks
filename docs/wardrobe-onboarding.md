# Onboarding tủ đồ (1.5)

Nhánh này dựa trên `feature/wardrobe-bulk-confirm` (1.2), cần API batch confirm khi triển khai.

Luồng: đăng ký → `/onboarding` lưu phong cách → `/onboarding/wardrobe` thêm và xác nhận món → `?step=outfit` tự gọi Quick Pick và hiển thị outfit đầu tiên.

- Tiến độ chỉ tính món CONFIRMED từ backend. Mục tiêu bắt đầu là 3 món, khuyến khích 3–5 món.
- Cần ít nhất một áo và một quần, hoặc một váy; các phụ kiện riêng không đủ để phối.
- Xác nhận batch đủ điều kiện sẽ tự chuyển sang outfit. Người dùng có dữ liệu từ trước có thể bấm xem outfit.
- `?scan=<id>` giữ lần quét đang xử lý để tải lại trang tiếp tục được. Mã này không thay thế kiểm tra quyền sở hữu ở backend.
- Có trạng thái tải, lỗi/thử lại, chưa phối được theo thời tiết và nút quay lại thêm món. Không gọi Quick Pick khi chưa đủ đồ.
- Có thể lưu outfit đầu tiên và vào trang chủ. Tiến độ sau tải lại lấy từ API, không lưu thông tin tủ đồ vào localStorage.

Chạy `npm run test`, `npm run build`, `npm run lint` trong `fe/web-app`. Test bao gồm tiến độ, bộ đồ không hợp lệ, tự chuyển bước, lỗi/thử lại và tiếp tục lần quét.
