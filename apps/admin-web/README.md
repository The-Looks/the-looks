# THE LOOKS · Admin Portal (Frontend)

Frontend ReactJS (Vite) cho Admin Web của The Looks / LOOKSY, dựng từ file Figma
"THE LOOKS · Mobile Wireframes · Typography" (node `Admin Web · Quản lý toàn diện · 13 màn`).

## Chạy thử

```bash
npm install
npm run dev
```

Mở http://localhost:5173. Trang đăng nhập nhận bất kỳ email/mật khẩu nào (dữ liệu mẫu).

## 13 màn hình

| Route | Màn hình Figma |
|---|---|
| `/login` | 01 Đăng nhập |
| `/` | 02 Tổng quan |
| `/users` | 03 Quản lý người dùng |
| `/users/:id` | 04 Chi tiết người dùng + 05 Xác nhận khóa (popup) |
| `/audit` | 06 Nhật ký thao tác |
| `/content` | 07 Duyệt nội dung |
| `/products` | 08 Quản lý sản phẩm |
| `/sync` | 09 Quản lý đồng bộ |
| `/notifications` | 10 Quản lý thông báo |
| `/settings` | 11 Cài đặt quản trị |
| `/plans` | 12 Doanh thu gói |
| `/affiliate` | 13 Doanh thu affiliate |

## Cấu trúc

- `src/shared/mock.js`: dữ liệu mẫu (thay bằng API Spring Boot khi có backend).
- `src/shared/store.jsx`: state dùng chung (người dùng, nhật ký, hàng đợi nội dung, toast).
- `src/app/`: App (routes), Layout (sidebar + topbar), styles.
- `src/shared/ui/`: các thành phần giao diện dùng lại (Icon, Ui).
- `src/features/<tính năng>/`: các màn hình của từng tính năng (users, products, plans...). Feature không import feature khác.

## Ghi chú

- Dữ liệu là dữ liệu minh họa theo wireframe.
- Logo hiện là chữ "THE LOOKS" bằng CSS; thay bằng file logo thật trong `public/` nếu cần.
- Màu và font theo brand: Primary Purple `#9440DD`, Accent Pink `#DB607E`, Plus Jakarta Sans + Inter.
