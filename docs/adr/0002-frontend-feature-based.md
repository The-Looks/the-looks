# ADR 0002: Frontend theo kiến trúc feature-based, TypeScript, client sinh từ OpenAPI

- Trạng thái: Được thay thế bởi ADR 0005
- Ngày: 2026-10-21

## Quyết định

Cả 3 app (`fe/mobile`, `fe/admin-web`, `fe/voting-web`) dùng cùng khuôn:

```
src/
  app/        # khởi tạo: navigation/router, providers, cấu hình môi trường
  features/   # mỗi tính năng một thư mục: screens|pages, components, hooks, api
  shared/     # ui, theme, api client sinh tự động, tiện ích — không biết gì về feature
```

Quy tắc phụ thuộc một chiều: `app → features → shared`.
- Feature không import feature khác. Cần dùng chung → chuyển xuống `shared/` hoặc ghép ở `app/`.
- `shared/` không import `features/` hay `app/`.
- Kiểm tra bằng ESLint (`import/no-restricted-paths`) trên CI.

Công nghệ:
- TypeScript strict.
- Dữ liệu server: TanStack Query. Trạng thái chỉ ở client: Zustand (khi thật sự cần).
- API client + kiểu dữ liệu sinh từ `be/packages/contracts/src/main/resources/openapi/*-api.yaml`, không viết tay.

## Lý do

Clean Architecture đầy đủ (domain/usecase/repository) ở frontend lặp lại logic đã nằm ở backend.
Feature-based giữ code của một tính năng ở một chỗ, ranh giới vẫn được máy kiểm tra.
Feature-Sliced Design đầy đủ (thêm widgets/entities/processes) để dành khi app vượt ~50 màn hoặc team FE > 4 người.
