# THE LOOKS · Web app (PWA)

App chính cho người dùng: React 18 + Vite + TypeScript, cài được lên màn hình chính điện thoại. Xem [ADR 0004](../../docs/adr/0004-web-app-first.md).

## Chạy

```bash
npm install
npm run dev            # http://localhost:5173
```

Mặc định cả bốn service chạy giả lập (MSW) theo contract — đăng nhập bằng email/mật khẩu bất kỳ.
Token của chế độ này chỉ dùng cho mock; không chứa secret và service thật sẽ từ chối.
Khi identity-service thật đã chạy, bỏ `identity` khỏi `VITE_MOCK_SERVICES` rồi mới kết nối
các service thật cần JWT. Ví dụ, để gọi outfit-service thật:

```bash
# trong be/ — profile demo dùng tủ đồ mẫu vì wardrobe-service chưa xong
./mvnw -pl services/outfit-service spring-boot:run -Dspring-boot.run.profiles=local,demo
```

Trong `.env.development.local`, đặt `VITE_MOCK_SERVICES=wardrobe,voting` khi identity-service
và outfit-service thật đã sẵn sàng. Service nào xong backend thật thì bỏ tên nó khỏi danh sách.

## Lệnh

| Lệnh | Việc |
|---|---|
| `npm run typecheck` / `lint` / `test` / `build` | Kiểm tra trước khi mở PR (CI chạy các lệnh này) |
| `npm run gen:api` | Sinh lại kiểu TypeScript khi `be/packages/contracts/.../*-api.yaml` đổi — commit kết quả |
| `npm run format` | Prettier |

## Cấu trúc (ADR 0002)

```
src/
  app/        router, AppShell (thanh dưới trên điện thoại, sidebar ≥1024px), RequireAuth, HomePage
  features/
    auth/       đăng nhập, đăng ký, onboarding        — Phát (identity-service)
    wardrobe/   tủ đồ, thêm món (camera), chi tiết    — Member 1 (wardrobe-service)
    outfit/     gợi ý theo dịp, Quick Pick, đã lưu    — Tuấn (outfit-service)
    voting/     bình chọn của tôi, tạo, kết quả       — Phát (voting-service)
    profile/    cá nhân, đăng xuất
  shared/     api (client sinh từ contract), ui, theme, lib, mocks (MSW)
```

- Feature **không import feature khác** (ESLint báo lỗi). Ghép nhiều feature vào một trang → làm ở `app/` (xem `HomePage`).
- Mỗi feature có `api.ts` (hook TanStack Query gọi service của mình) và `index.ts` (phần công khai).

## Deploy

Vercel: thư mục gốc `fe/web-app`, build `npm run build`, output `dist`.
Sửa `BACKEND_HOST` trong `vercel.json` thành địa chỉ máy chủ backend.
