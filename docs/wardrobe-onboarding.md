# Chào đón người mới

Sau khi đăng ký hoặc đăng nhập với tài khoản chưa có sở thích và tủ đồ còn trống, web mở luồng chào đón:

1. `/onboarding/welcome` để chọn linh vật.
2. `/onboarding` để làm khảo sát và lưu phong cách.
3. `/onboarding/wardrobe` để thêm và xác nhận ba món đầu tiên.
4. `/onboarding/wardrobe?step=outfit` để xem outfit đầu tiên do Quick Pick gợi ý.

Lựa chọn linh vật và trạng thái bỏ qua hoặc hoàn tất được lưu trong trình duyệt theo ID tài khoản. Các mã linh vật là `cat`, `fox`, `rabbit`, `bear`, `frog` và `penguin`. Tệp SVG tương ứng nằm trong `fe/web-app/public/illustrations/`.

- Tiến độ chỉ tính món CONFIRMED từ backend. Mục tiêu bắt đầu là 3 món, khuyến khích 3–5 món.
- Cần ít nhất một áo và một quần, hoặc một váy; các phụ kiện riêng không đủ để phối.
- Xác nhận batch đủ điều kiện sẽ tự chuyển sang outfit. Người dùng có dữ liệu từ trước có thể bấm xem outfit.
- `?scan=<id>` giữ lần quét đang xử lý để tải lại trang tiếp tục được. Mã này không thay thế kiểm tra quyền sở hữu ở backend.
- Có trạng thái tải, lỗi/thử lại, chưa phối được theo thời tiết và nút quay lại thêm món. Không gọi Quick Pick khi chưa đủ đồ.
- Có thể lưu outfit đầu tiên và vào trang chủ. Tiến độ sau tải lại lấy từ API, không lưu thông tin tủ đồ vào localStorage.

Để thử luồng, chạy `npm run dev:mock` trong `fe/web-app` và đăng ký một tài khoản mới. Chạy `npm test`, `npm run build` và `npm run lint` để kiểm tra thay đổi.
