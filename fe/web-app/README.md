# THE LOOKS · Web app (PWA)

App chính cho người dùng: React 18 + Vite + TypeScript, cài được lên màn hình chính điện thoại. Xem [ADR 0004](../../docs/adr/0004-web-app-first.md).

## Chạy

```powershell
npm install
Copy-Item https.env.example .env.https # lần đầu, file local không chứa secret
npm run dev            # https://localhost:5173, gọi cả 5 backend service thật
```

Trước đó, trong `be/` chạy `docker compose up -d --build` với file `.env` đã cấu hình.
Trong `.env.https`, để `VITE_MOCK_SERVICES=` trống. Mọi request `/api/...` sẽ được
Vite proxy chuyển tới đúng service trên cổng 8081–8085. `npm run dev:mock` chạy bản demo
tại `http://localhost:5173` với các service giả lập (MSW). `npm run dev:https` tương đương `npm run dev`.
Chế độ mock chỉ giữ danh tính demo trong `sessionStorage`; không tạo JWT. Với backend thật,
access và refresh token đều ở cookie HttpOnly. JavaScript chỉ giữ thời điểm hết hạn access token.
`dev:https` dùng chứng chỉ tự ký cho môi trường local; trình duyệt sẽ yêu cầu xác nhận
chứng chỉ lần đầu. Trước khi thử Google login qua HTTPS, đặt `WEB_ORIGIN=https://localhost:5173`
và `GOOGLE_REDIRECT_URI=https://localhost:5173/api/public/auth/google/callback` cho
auth-service, rồi đăng ký đúng redirect URI HTTPS đó trong Google Cloud Console.
Trong `be/.env`, đặt `WEB_ORIGIN`, `WEB_APP_URL`, `SHARE_BASE_URL` là
`https://localhost:5173` và `GOOGLE_REDIRECT_URI` là
`https://localhost:5173/api/public/auth/google/callback`. Khởi động lại auth-service
nếu thay đổi các giá trị này.

Ở local, trình duyệt ↔ Vite dùng HTTPS, còn Vite ↔ backend vẫn dùng HTTP trên
loopback. Bản deploy dùng HTTPS ở cả đường từ trình duyệt tới Vercel và từ
Vercel tới các service trên Render.
Trang quản trị hiện chỉ có API thật cho chi phí LOOKSY AI. Các bảng người dùng,
nội dung, sản phẩm và doanh thu vẫn hiển thị dữ liệu minh họa vì backend chưa có
endpoint tương ứng; giao diện có nhãn để phân biệt.

Google OAuth thật cần mở web bằng đúng origin trong `WEB_ORIGIN` và
`GOOGLE_REDIRECT_URI` của auth-service (`https://localhost:5173`,
không dùng `127.0.0.1`). `VITE_GOOGLE_ORIGIN` đưa nút Google về origin này trước
khi bắt đầu OAuth để cookie `state` được gửi lại ở callback. Nếu `auth` còn trong
`VITE_MOCK_SERVICES`, nút Google chỉ mô phỏng đăng nhập; muốn thử Google thật thì
bỏ `auth` khỏi danh sách rồi khởi động lại Vite. Nếu quay về `/login?google=failed`,
xem log auth-service để biết callback bị từ chối ở bước state, token, email hay liên kết tài khoản.

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
    auth/       đăng nhập, đăng ký, onboarding        — Phát (auth-service)
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
`vercel.json` chuyển `/api/...` tới các service trên Render (`thelooks-<service>.onrender.com`, xem `render.yaml` ở gốc repo).
