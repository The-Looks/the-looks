# ADR 0005: Hai frontend, phân thư mục theo vai trò và tính năng

- Trạng thái: Đã chấp nhận
- Ngày: 2026-11-03
- Thay thế: ADR 0002

## Quyết định

`fe/` chỉ chứa hai ứng dụng: `web-app/` và `mobile/`. Admin và trang bình chọn của khách được phục vụ qua các route trong `web-app`; mã nguồn hai ứng dụng độc lập cũ nằm ở `docs/archive/frontends/` để tham khảo.

Mỗi ứng dụng dùng cùng năm nhóm trong `src/`:

```text
src/
  app/         điểm vào, router hoặc navigation
  components/  shared/, guest/, user/, admin/ rồi đến feature
  pages/       guest/, user/, admin/ rồi đến feature
  services/    shared/, guest/, user/, admin/ rồi đến feature
  interface/   DTO TypeScript theo role và feature
  hooks/       guest/, user/, admin/ rồi đến feature
```

`web-app/src/interface/dto/` chứa **type-only** sinh từ OpenAPI backend bằng `npm run gen:api`; không implement DTO ở frontend. `mobile/src/interface/dto/index.ts` re-export cùng các kiểu đó. Mobile hiện vẫn dùng dữ liệu mẫu, chưa có API runtime.

Nguồn nhận diện chung là `fe/web-app/brand.json`: màu, font, cỡ chữ, nội dung chung và đường dẫn ảnh. Các file ảnh, font chỉ có một bản tại `fe/web-app/public/`. Web tạo CSS variables và cấu hình Ant Design từ manifest. Mobile đọc manifest, dùng chính các asset đó qua Metro `watchFolders`. Đổi một token hoặc thay một file asset sẽ tác động cả hai bản sau khi build lại.

Giữ manifest trong `web-app/` vì Vercel build ứng dụng này với thư mục gốc `fe/web-app`; mobile tham chiếu tới đó khi chạy trong monorepo. `app/` được giữ riêng cho router/navigation và phần bootstrap của framework.
