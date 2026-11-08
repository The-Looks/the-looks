# Việc cần làm bằng tay

Những việc code không tự làm được: tạo tài khoản, bấm trên web, nhập khoá bí mật, quyết định của nhóm.
Làm xong thì đánh dấu `[x]` và ghi ngày. Có việc mới thì thêm vào đúng nhóm, ghi rõ **ai làm** và **khi nào cần**.

> **Không ghi khoá bí mật, mật khẩu, token vào file này** (repo dùng chung). Chỉ ghi tên biến môi trường.

Cập nhật lần cuối: 01/11/2026 (sau review toàn bộ PR)

---

## 1. GitHub

- [ ] **Đẩy file CI lên GitHub** · Tuấn · càng sớm càng tốt
  File `.github/workflows/ci.yml` đang nằm trên máy Tuấn, chưa push được vì token thiếu quyền `workflow`. Chọn một cách:
  - Chạy `gh auth refresh -h github.com -s workflow` (cần xác nhận đăng nhập GitHub), rồi nhờ Claude push.
  - Hoặc trên web: repo → **Add file → Create new file** → tên `.github/workflows/ci.yml` → dán nội dung file → **Commit**.
- [ ] **Bật bảo vệ nhánh `main`** · Tuấn (admin) · sau khi CI chạy được
  Settings → Branches → Add rule cho `main`: bắt buộc Pull Request, ít nhất 1 người duyệt, CI phải xanh.
- [x] **Mời Thạch (`thachhn404`) vào tổ chức `The-Looks` và cấp quyền Write cho repo** · 01/11
  Thành viên mới mặc định chỉ có quyền đọc: người mới vào nhóm cần được nâng lên Write mới push được.
- [ ] **Thêm file `CODEOWNERS`** · Tuấn (tự gán người review theo service: wardrobe → `thachhn404`, outfit + billing → `tennyhoang`, auth + voting → `DoTruongPhat`)
- [ ] **Xoá nhánh đã merge `feature/web-app`** · Tuấn · bấm **Delete branch** trong PR #1
- [ ] **Review và merge PR theo thứ tự** · cả nhóm (Claude không tự merge được: cần người review)
  - [x] #2, #3 của Phát đã lên `main` (01/11)
  - #4 (thích/không thích) → #5 (thời tiết, AI, học gu) → #9 (lượt AI theo gói, base là #5)
  - #6 (gói thuê bao) → #8 (quét nhiều món/ảnh, đã chứa #6) → #10 (wardrobe-service chạy thật, base là #8)
  - #11 (chống spam bình chọn + test, Phát review) · #7 (tài liệu này)
  - PR nối tiếp (#9, #10): sau khi PR nền merge, bấm **Edit** cạnh tiêu đề PR để đổi base sang `main`.
  - Muốn Claude tự merge: thêm quyền trong `.claude/settings.json` hoặc bấm duyệt khi được hỏi.

## 2. Tài khoản dịch vụ và khoá bí mật

Khoá đặt vào biến môi trường trên máy chủ (hoặc `be/.env` trên máy dev, file này không commit).

- [ ] **Gemini (AI chính: gợi ý outfit + nhận diện quần áo)** · Tuấn · trước khi deploy bản có Gemini
  1. Tạo key ở https://aistudio.google.com → Get API key. Bật thanh toán / đặt hạn mức chi tiêu trong Google Cloud.
  2. Render → `thelooks-wardrobe` và `thelooks-outfit` → Environment: `GEMINI_API_KEY` (chung một key), `AI_PROVIDER=auto`.
  3. Kiểm tra tên model trong `thelooks.ai.gemini-model` / `gemini-backup-model` còn đúng với danh sách model của Google;
     sai tên thì mọi lần gọi lỗi rồi mới chuyển sang Claude (chậm thêm vài giây).
- [ ] **Anthropic (AI dự phòng khi Gemini lỗi)** · Tuấn · tuỳ chọn
  1. Tạo key ở https://console.anthropic.com → API Keys. Đặt **giới hạn chi tiêu tháng** ngay trong console.
  2. Biến môi trường outfit-service: `AI_PROVIDER=claude`, `ANTHROPIC_API_KEY=...`
     (model mặc định `claude-haiku-5-5`; ngân sách app tự giới hạn bằng `AI_MONTHLY_BUDGET_USD`, mặc định 25).
- [ ] **PayOS (thanh toán gói, nhóm đã chốt 05/11)** · Tuấn · trước khi bán gói thật
  1. Đăng ký https://my.payos.vn bằng tài khoản ngân hàng của nhóm, tạo kênh thanh toán.
  2. Render → Blueprint → **Manual Sync** để tạo `thelooks-billing`, điền: `DB_URL` (database `thelooks_billing`), `DB_PASSWORD`,
     `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` (lấy trong kênh thanh toán PayOS). Thiếu key PayOS thì billing không khởi động.
  3. Khai báo webhook trong PayOS: `https://the-looks.vercel.app/api/public/billing/payos/webhook`.
  4. Mua thử 1 gói Plus tháng (49.000đ) bằng tiền thật để kiểm tra trọn luồng.
  Tự gia hạn: chưa trừ tiền tự động; app nhắc trước 3 ngày, giữ gói thêm 3 ngày ân hạn, người dùng bấm "Thanh toán gia hạn".
- [ ] **Email nhắc gia hạn (Brevo)** · Tuấn · tuỳ chọn, không có thì chỉ nhắc trong app
  Render free chặn cổng SMTP (25/465/587) nên không gửi qua Gmail SMTP được; billing gọi API HTTPS của Brevo (free 300 email/ngày).
  1. Đăng ký https://www.brevo.com → **Senders, Domains & Dedicated IPs → Senders → Add a sender**: nhập email nhóm
     (ví dụ Gmail của nhóm), bấm link xác minh Brevo gửi về hộp thư đó.
  2. **SMTP & API → API Keys → Generate a new API key**.
  3. Render → `thelooks-billing` → Environment: `BREVO_API_KEY`, `MAIL_FROM` (đúng email đã xác minh ở bước 1) → Save, rebuild and deploy.
  4. Thử: tài khoản test mua gói, sửa `expires_at` của dòng đó trong `billing_subscription` (Neon, `thelooks_billing`) thành 2 ngày tới,
     đợi tối đa 1 giờ (service phải đang thức) → email tới. Kiểm tra cả mục Spam.
  Người gửi là Gmail thì dễ vào Spam; có tên miền riêng thì xác minh tên miền trong Brevo và đổi `MAIL_FROM` sang email tên miền.
  Email người nhận được lưu lúc họ bấm thanh toán, nên người mua trước bản này chỉ được nhắc từ lần thanh toán sau.
- [ ] **Trừ tiền tự động thật (VNPay token / liên kết MoMo)** · nhóm · khi có hộ kinh doanh hoặc công ty
- [ ] **Cloudinary (lưu ảnh tủ đồ)** · Tuấn hoặc Thạch · trước khi deploy
  Đăng ký https://cloudinary.com (gói Free) → Dashboard lấy Cloud name, API Key, API Secret.
  Biến môi trường wardrobe-service: `IMAGE_STORAGE=cloudinary`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- [ ] **Bật AI nhận diện quần áo** · khi có key Anthropic
  wardrobe-service: `AI_PROVIDER=claude` + `ANTHROPIC_API_KEY` (dùng chung key với outfit-service). Chạy thử với 20–30 ảnh thật, xem AI cắt đúng món chưa.
- [ ] **Google Login** · Phát · khi merge PR #3
  Google Cloud Console → tạo OAuth Client ID (Web) → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.
- [ ] **Khoá và bí mật của identity / voting** · Phát · khi deploy
  Tạo khoá ký JWT bằng `be/scripts/generate-jwt-key.ps1`; đặt `PASSWORD_PEPPER`, `VOTER_KEY_SECRET` (chuỗi ngẫu nhiên dài),
  `ADMIN_BOOTSTRAP_EMAIL` (email admin đầu tiên).
  **Không đổi `PASSWORD_PEPPER` sau khi có người dùng**, nếu đổi thì không ai đăng nhập được.

## 3. Deploy

- [ ] **Web demo trên Vercel** · Tuấn
  1. https://vercel.com → Add New → Project → chọn repo `the-looks`, **Root Directory** `fe/web-app`.
  2. Environment Variables: `VITE_MOCK_SERVICES=auth,wardrobe,outfit,voting,billing` (bản demo dùng dữ liệu mẫu).
  3. Muốn gửi link cho người ngoài nhóm: Settings → Deployment Protection → tắt Vercel Authentication.
- [ ] **Database trên Neon (free)** · Tuấn
  1. https://neon.tech → tạo project, vùng **Singapore**.
  2. SQL Editor: `CREATE DATABASE thelooks_identity;` và tương tự `thelooks_wardrobe`, `thelooks_outfit`, `thelooks_voting`, `thelooks_billing`.
     Không cần tạo bảng: Flyway tự tạo khi service chạy.
  3. Connect → ghi lại **host** (dạng `ep-...ap-southeast-1.aws.neon.tech`) và **mật khẩu** của user `neondb_owner`.
- [ ] **Backend trên Render (free)** · Tuấn · sau khi có Neon
  1. Tạo khoá ký JWT (Git Bash): `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out jwt-private.pem`.
     Giữ file này ở ngoài repo, mất khoá thì mọi người phải đăng nhập lại.
  2. https://render.com → New → **Blueprint** → repo `the-looks`, nhánh `main`, **Blueprint Path để trống** (file `render.yaml` ở gốc).
  3. Điền các ô Render hỏi:
     - `DB_URL`: `jdbc:postgresql://<host Neon>/<database của service>?sslmode=require`
       (auth → `thelooks_identity`, wardrobe → `thelooks_wardrobe`, outfit → `thelooks_outfit`, voting → `thelooks_voting`)
     - `DB_PASSWORD`: mật khẩu Neon (cả 4 service giống nhau)
     - `WEB_ORIGIN` trên cả 4 service, `PUBLIC_BASE_URL`, `SHARE_BASE_URL`: cùng link Vercel, vd `https://the-looks.vercel.app`
     - `ANTHROPIC_API_KEY`: key Claude (wardrobe và outfit)
  4. Service `thelooks-auth` → Environment → **Secret Files** → thêm file tên `jwt-private.pem`, dán nội dung khoá ở bước 1.
  5. Kiểm tra tên 4 service trên Render đúng là `thelooks-auth`, `-wardrobe`, `-outfit`, `-voting`.
     Nếu Render thêm đuôi khác vào link thì sửa URL trong `render.yaml` và `fe/web-app/vercel.json`.
  6. Mở `https://thelooks-auth.onrender.com/actuator/health` thấy `UP` là chạy.
  7. Vercel: đổi `VITE_MOCK_SERVICES=billing` (chỉ billing còn giả) → Redeploy.
  Gói free: service ngủ sau 15 phút không dùng, lần mở đầu chờ khoảng 1 phút. Ảnh tủ đồ mất khi service khởi động lại
  cho tới khi bật Cloudinary. `thelooks-billing` cần 3 key PayOS (mục 2).
- [ ] **Mua tên miền** · nhóm · trước khi ra mắt T1/2027 (ngân sách 500.000đ)

## 4. Máy dev của Tuấn

- [ ] **Lưu mật khẩu user `postgres`** (đã đưa riêng lúc cài) vào trình quản lý mật khẩu.
- [ ] *(Tuỳ chọn)* **Cài Docker Desktop** để chạy test tích hợp (Testcontainers) trên máy:
  bật Intel VT-x / AMD SVM trong BIOS trước. Không có Docker thì CI trên GitHub vẫn chạy các test này.

## 5. Phối hợp trong nhóm

- [ ] **Báo Thạch** · Tuấn
  - outfit-service gọi `GET /api/app/wardrobe/items?status=CONFIRMED`; giữ đúng schema trong `wardrobe-api.yaml`.
  - Upload ảnh phải trả **403** khi tủ đồ đã đủ `limits.wardrobeItems` (lấy từ `GET /api/app/billing/me`).
  - Khi xong, báo Tuấn để bỏ `FakeWardrobeReader` (profile `demo`) trong outfit-service.
  - **Hợp đồng mới (PR #8):** thêm đồ bằng `POST /api/app/wardrobe/scans` (1–10 ảnh, mỗi ảnh nhiều món), bỏ `POST /items`.
    Cài đặt `GarmentDetector` (đề xuất Claude Haiku 5.5 vision), `ImageCropper`, lưu Cloudinary; không lưu ảnh gốc.
- [ ] **Báo Phát các điểm review PR #2, #3** · Tuấn
  Chống spam bình chọn (thêm IP vào voter key + giới hạn tần suất), cache kiểm tra phiên ~30 giây, thêm test đăng nhập/refresh/bình chọn.
- [x] **Chốt giá gói** · nhóm · 04/11
  Plus 49.000đ/tháng · 499.000đ/năm, Pro 79.000đ/tháng · 799.000đ/năm (trong `Plan.java`).
- [x] **Chọn nền tảng affiliate** (luồng doanh thu 2) · 02/11: AccessTrade (tài khoản publisher của Tuấn)
  Đã duyệt: TikTok Shop, Adidas, ALDO, ANTA, Aristino, Shondo, Hoàng Phúc, Bảo Tín Mạnh Hải. Chờ duyệt: Shopee, Shein.
- [ ] **Bật "Gợi ý mua thêm" (TikTok Shop)** · Tuấn · sau khi merge PR affiliate
  1. AccessTrade → API key → **tạo key mới** (key cũ đã lộ trong log lúc kiểm tra), thay vào `be/.env`.
  2. Render → `thelooks-outfit` → Environment: `ACCESSTRADE_API_KEY` = key mới → Save.
  3. Xem lượt bấm: Neon, database `thelooks_outfit`, bảng `affiliate_click`; hoa hồng xem trên AccessTrade (đối chiếu theo `sub1`).
  Rút tiền: AccessTrade chỉ mở **Thông tin thanh toán** khi hoa hồng trên 200.000đ.
  4. Từ 08/11 gợi ý lấy thêm sản phẩm từ **mọi chiến dịch đã duyệt** (datafeeds), không chỉ TikTok Shop. Không cần làm gì;
     xem log `thelooks-outfit` dòng `AccessTrade datafeeds: N sản phẩm từ … chiến dịch` (tải nền ở lần gợi ý đầu, làm mới 12 giờ).
     Muốn chỉ dùng vài chiến dịch thời trang: thêm biến `ACCESSTRADE_CAMPAIGNS` = merchant cách nhau dấu phẩy (vd `coolmate,yody`).
     Đăng ký thêm chiến dịch thời trang trên AccessTrade → được duyệt là tự có sản phẩm, không cần sửa code.
- [ ] **Phí giao dịch** (luồng doanh thu 3) · nhóm · chưa chốt
  Cần: % phí trên đơn mua qua đối tác, đối tác đầu tiên.

## 6. Tài liệu nộp và pháp lý

- [ ] **Sửa tài liệu dự án cho khớp với "web trước, mobile sau"** · nhóm
  Bỏ React Native/Expo/EAS, chi phí Apple Developer và Google Play khỏi bảng công nghệ và ngân sách;
  ghi Vercel chỉ chạy frontend, Spring Boot chạy máy chủ riêng; lưu ảnh: Cloudinary.
- [ ] **Chính sách quyền riêng tư + màn xin đồng ý + cách xoá dữ liệu** · nhóm · trước khi ra mắt
  Theo Luật Bảo vệ dữ liệu cá nhân (hiệu lực 01/01/2026). Nội dung pháp lý cần người viết và duyệt; code làm sau khi có nội dung.
