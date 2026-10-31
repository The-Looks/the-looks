# ADR 0004: Web app (PWA) trước, app mobile sau

- Trạng thái: Đã chấp nhận
- Ngày: 2026-10-31

## Bối cảnh

MVP phải xong T11–T12/2026 với 3 người, ra mắt giới hạn T1/2027 cho sinh viên FPT.
App mobile (Expo) mới là màn hình dữ liệu mẫu, chưa nối API. Môn học không bắt buộc React Native.

## Quyết định

- App chính cho người dùng là **`fe/web-app`**: React 18 + Vite + TypeScript, chạy dạng PWA
  (cài lên màn hình chính, chụp ảnh bằng camera qua `<input type="file" capture>`).
- `fe/mobile` **tạm dừng**, giữ lại để tham khảo giao diện và làm tiếp khi đã có người dùng thật.
- Theo ADR 0002: `app → features → shared`, ESLint chặn import chéo feature; TanStack Query;
  kiểu dữ liệu sinh từ OpenAPI (`npm run gen:api`), không viết tay.
- Gọi backend cùng origin: Vite proxy khi dev, `vercel.json` rewrites khi production (đóng vai API gateway).
- Service nào chưa xong thì giả lập bằng MSW theo đúng contract (`VITE_MOCK_SERVICES`).
- outfit-service có profile `demo` (tủ đồ mẫu) để demo gợi ý thật khi wardrobe-service chưa xong.

## Hệ quả

- Không cần tài khoản Apple Developer / Google Play (~3,2 triệu đ), không chờ duyệt app.
- Bán gói trên web được tích hợp MoMo/VNPay/PayOS trực tiếp (không bị bắt dùng In-App Purchase).
- Người dùng mở link qua Zalo là dùng được, hợp với Ask Friends.
- Thông báo đẩy trên iPhone chỉ có khi người dùng đã thêm web vào màn hình chính (iOS 16.4+).
- Không có mặt trên App Store/Google Play; xem lại khi có số liệu Retention.
- Backend không đổi.
