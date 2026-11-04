> **Tạm dừng** (31/10/2026): app chính chuyển sang [fe/web-app](../web-app) theo [ADR 0004](../../docs/adr/0004-web-app-first.md). Giữ thư mục này để tham khảo giao diện và làm tiếp sau.

# THE LOOKS – User app (React Native + Expo)

37 màn mobile theo Figma "V2 · App + Website · 39 màn" (dữ liệu mẫu, chưa nối backend).

## Chạy
```
npm install --legacy-peer-deps
npx expo start        # quét QR bằng Expo Go, hoặc nhấn w để mở bản web
```

## Cấu trúc
- `src/app/App.js` – điều hướng (Stack + 5 tab).
- `src/components/shared/` – component dùng chung.
- `src/pages/{guest,user}/<feature>/` – các màn theo vai trò và tính năng.
- `src/services/shared/` – theme, asset registry và dữ liệu mẫu.
- `src/interface/dto/` – chỉ re-export type từ OpenAPI backend, không implement DTO.
- `src/hooks/{guest,user}/<feature>/` – trạng thái tương tác của màn hình.
- `../web-app/brand.json` và `../web-app/public/` – màu, nội dung, logo, ảnh, font chung; Metro được cấu hình để đọc asset ngoài thư mục mobile.

## Lưu ý
- Ảnh sản phẩm đang là ô màu + emoji (chưa tải được ảnh từ Figma) – thay bằng ảnh thật khi có.
- Thử đồ 3D, AI phối đồ, đồng bộ Shopee/TikTok là giao diện mẫu, chưa có logic thật.
- Trang bình chọn dành cho bạn bè nằm trong `fe/web-app` tại route `/v/:code`.
