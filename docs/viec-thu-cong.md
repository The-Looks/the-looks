# Việc cần làm bằng tay

Những việc code không tự làm được: tạo tài khoản, bấm trên web, nhập khoá bí mật, quyết định của nhóm.
Làm xong thì đánh dấu `[x]` và ghi ngày. Có việc mới thì thêm vào đúng nhóm, ghi rõ **ai làm** và **khi nào cần**.

> **Không ghi khoá bí mật, mật khẩu, token vào file này** (repo dùng chung). Chỉ ghi tên biến môi trường.

Cập nhật lần cuối: 01/11/2026

---

## 1. GitHub

- [ ] **Đẩy file CI lên GitHub** · Tuấn · càng sớm càng tốt
  File `.github/workflows/ci.yml` đang nằm trên máy Tuấn, chưa push được vì token thiếu quyền `workflow`. Chọn một cách:
  - Chạy `gh auth refresh -h github.com -s workflow` (cần xác nhận đăng nhập GitHub), rồi nhờ Claude push.
  - Hoặc trên web: repo → **Add file → Create new file** → tên `.github/workflows/ci.yml` → dán nội dung file → **Commit**.
- [ ] **Bật bảo vệ nhánh `main`** · Tuấn (admin) · sau khi CI chạy được
  Settings → Branches → Add rule cho `main`: bắt buộc Pull Request, ít nhất 1 người duyệt, CI phải xanh.
- [ ] **Mời Member 1 vào tổ chức `The-Looks`** và gửi username GitHub cho cả nhóm · Tuấn
  Cần để thêm file `CODEOWNERS` (tự gán người review theo service).
- [ ] **Xoá nhánh đã merge `feature/web-app`** · Tuấn · bấm **Delete branch** trong PR #1
- [ ] **Review và merge PR theo thứ tự** · cả nhóm
  - Phát: #2 (JWKS) → #3 (đăng nhập, bình chọn)
  - Tuấn: #4 (thích/không thích) → #5 (thời tiết, AI, học gu) → #6 (gói thuê bao)

## 2. Tài khoản dịch vụ và khoá bí mật

Khoá đặt vào biến môi trường trên máy chủ (hoặc `be/.env` trên máy dev, file này không commit).

- [ ] **Anthropic (AI gợi ý outfit)** · Tuấn · khi muốn bật AI thật
  1. Tạo key ở https://console.anthropic.com → API Keys. Đặt **giới hạn chi tiêu tháng** ngay trong console.
  2. Biến môi trường outfit-service: `AI_PROVIDER=claude`, `ANTHROPIC_API_KEY=...`
     (model mặc định `claude-haiku-5-5`; ngân sách app tự giới hạn bằng `AI_MONTHLY_BUDGET_USD`, mặc định 25).
- [ ] **PayOS (thanh toán gói)** · Tuấn · trước khi bán gói thật
  1. Đăng ký https://my.payos.vn bằng tài khoản ngân hàng của nhóm, tạo kênh thanh toán.
  2. Lấy `Client ID`, `API Key`, `Checksum Key` → biến `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`, và `PAYMENT_GATEWAY=payos`.
  3. Khai báo webhook: `https://<tên-miền>/api/public/billing/payos/webhook`.
  4. Mua thử 1 gói Plus tháng bằng tiền thật để kiểm tra trọn luồng.
- [ ] **Google Login** · Phát · khi merge PR #3
  Google Cloud Console → tạo OAuth Client ID (Web) → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.
- [ ] **Khoá và bí mật của identity / voting** · Phát · khi deploy
  Tạo khoá ký JWT bằng `be/scripts/generate-jwt-key.ps1`; đặt `PASSWORD_PEPPER`, `VOTER_KEY_SECRET` (chuỗi ngẫu nhiên dài),
  `ADMIN_BOOTSTRAP_EMAIL` (email admin đầu tiên).
  **Không đổi `PASSWORD_PEPPER` sau khi có người dùng**, nếu đổi thì không ai đăng nhập được.

## 3. Deploy

- [ ] **Web demo trên Vercel** · Tuấn
  1. https://vercel.com → Add New → Project → chọn repo `the-looks`, **Root Directory** `fe/web-app`.
  2. Environment Variables: `VITE_MOCK_SERVICES=identity,wardrobe,outfit,voting,billing` (bản demo dùng dữ liệu mẫu).
  3. Muốn gửi link cho người ngoài nhóm: Settings → Deployment Protection → tắt Vercel Authentication.
- [ ] **Backend miễn phí (Render + Neon)** · Tuấn · khi identity và wardrobe chạy được (dự kiến giữa T11)
  Tạo Postgres trên Neon, 5 service trên Render từ Dockerfile; thay `BACKEND_HOST` trong `fe/web-app/vercel.json`;
  bỏ dần tên service đã chạy thật khỏi `VITE_MOCK_SERVICES`.
- [ ] **Mua tên miền** · nhóm · trước khi ra mắt T1/2027 (ngân sách 500.000đ)

## 4. Máy dev của Tuấn

- [ ] **Lưu mật khẩu user `postgres`** (đã đưa riêng lúc cài) vào trình quản lý mật khẩu.
- [ ] *(Tuỳ chọn)* **Cài Docker Desktop** để chạy test tích hợp (Testcontainers) trên máy:
  bật Intel VT-x / AMD SVM trong BIOS trước. Không có Docker thì CI trên GitHub vẫn chạy các test này.

## 5. Phối hợp trong nhóm

- [ ] **Báo Member 1** · Tuấn
  - outfit-service gọi `GET /api/app/wardrobe/items?status=CONFIRMED`; giữ đúng schema trong `wardrobe-api.yaml`.
  - Upload ảnh phải trả **403** khi tủ đồ đã đủ `limits.wardrobeItems` (lấy từ `GET /api/app/billing/me`).
  - Khi xong, báo Tuấn để bỏ `FakeWardrobeReader` (profile `demo`) trong outfit-service.
- [ ] **Chốt giá gói** · nhóm · trước khi bật PayOS
  Đang đề xuất: Plus 39.000đ/tháng · 390.000đ/năm, Pro 79.000đ/tháng · 790.000đ/năm (sửa trong `Plan.java`).
- [ ] **Chọn hướng cho affiliate và phí giao dịch** (luồng doanh thu 2 và 3) · nhóm
  Cần: nền tảng affiliate (Shopee/TikTok/AccessTrade…), % phí trên đơn mua qua đối tác, đối tác đầu tiên.

## 6. Tài liệu nộp và pháp lý

- [ ] **Sửa tài liệu dự án cho khớp với "web trước, mobile sau"** · nhóm
  Bỏ React Native/Expo/EAS, chi phí Apple Developer và Google Play khỏi bảng công nghệ và ngân sách;
  ghi Vercel chỉ chạy frontend, Spring Boot chạy máy chủ riêng; lưu ảnh: Cloudinary.
- [ ] **Chính sách quyền riêng tư + màn xin đồng ý + cách xoá dữ liệu** · nhóm · trước khi ra mắt
  Theo Luật Bảo vệ dữ liệu cá nhân (hiệu lực 01/01/2026). Nội dung pháp lý cần người viết và duyệt; code làm sau khi có nội dung.
