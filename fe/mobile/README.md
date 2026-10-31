> **Tạm dừng** (31/10/2026): app chính chuyển sang [fe/web-app](../web-app) theo [ADR 0004](../../docs/adr/0004-web-app-first.md). Giữ thư mục này để tham khảo giao diện và làm tiếp sau.

# THE LOOKS – User app (React Native + Expo)

37 màn mobile theo Figma "V2 · App + Website · 39 màn" (dữ liệu mẫu, chưa nối backend).

## Chạy
```
npm install --legacy-peer-deps
npx expo start        # quét QR bằng Expo Go, hoặc nhấn w để mở bản web
```

## Cấu trúc
- `src/app/App.js` – điều hướng (Stack + 5 tab: Trang chủ, Tủ đồ, Phối đồ, Bình chọn, Cá nhân)
- `src/shared/theme.js` – màu / font thương hiệu (Plus Jakarta Sans + Inter)
- `src/shared/ui.js` – component dùng chung
- `src/shared/mock.js` – dữ liệu mẫu (Thảo Nguyên, 68 món đồ, bình chọn 18 lượt…)
- `src/features/<tính năng>/screens.js` – auth (01,19–23), wardrobe (02–05,24,25,31), outfit (06–09,26–30,35–37), voting (10–13,32,33), profile (14–18,34)

## Lưu ý
- Ảnh sản phẩm đang là ô màu + emoji (chưa tải được ảnh từ Figma) – thay bằng ảnh thật khi có.
- Thử đồ 3D, AI phối đồ, đồng bộ Shopee/TikTok là giao diện mẫu, chưa có logic thật.
- Trang bình chọn dành cho bạn bè (màn 39) nằm ở dự án `the-looks-voting-web`.
