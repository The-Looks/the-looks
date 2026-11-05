# THE LOOKS · Backend (Maven microservices)

| Thư mục | Nội dung | Cổng | Phụ trách |
|---|---|---|---|
| `services/auth-service` | Đăng ký, đăng nhập, phát JWT, phân quyền | 8081 | Member 3 (Phát) |
| `services/wardrobe-service` | Tủ đồ số: upload, AI nhận diện, xác nhận/sửa/xoá | 8082 | Member 1 |
| `services/outfit-service` | AI gợi ý theo dịp + Quick Pick | 8083 | Member 2 (Tuấn) |
| `services/voting-service` | Ask Friends: bình chọn A/B qua link | 8084 | Member 3 (Phát) |
| `services/billing-service` | Gói Free / Plus / Pro, thanh toán PayOS | 8085 | Member 2 (Tuấn) |
| `packages/contracts` | OpenAPI của từng service — **sửa ở đây trước khi code** | | |
| `packages/security` | Xác thực JWT dùng chung + chuyển tiếp token khi gọi service khác | | |
| `packages/observability` | Correlation ID (header `X-Correlation-Id`, có trong log) | | |
| `infrastructure/docker` | Script tạo database cho từng service | | |

## Cấu trúc auth-service

```
services/auth-service/src/main/java/vn/thelooks/auth/
  application/port/in/          use case interfaces
  application/port/out/         interfaces tới hạ tầng
  application/service/          xử lý nghiệp vụ
  domain/enums/                 UserStatus
  domain/exception/             lỗi nghiệp vụ
  domain/model/                 User
  infrastructure/config/       Clock
  infrastructure/crypto/       Argon2 và phát JWT
  infrastructure/external/google/  Google OIDC
  infrastructure/persistence/adapter/     JDBC/JPA adapters
  infrastructure/persistence/entity/      JPA entities, BaseEntity
  infrastructure/persistence/mapper/      ánh xạ entity ↔ domain
  infrastructure/persistence/repository/  Spring Data repository
  infrastructure/security/config/         cấu hình khóa JWT
  presentation/advice/         ánh xạ lỗi HTTP
  presentation/controller/     REST endpoints
  presentation/mapper/         ánh xạ response
  presentation/request/        request DTOs
  presentation/response/       response DTOs
```
Các nhánh như Kafka, Keycloak, event hoặc filter sẽ được thêm khi có code dùng đến.
`ArchitectureTest` kiểm tra ranh giới các lớp trên CI.

## Role và permission

`users` là bảng tài khoản có sẵn. Flyway V3 thêm bốn bảng phân quyền:
`roles` (mã role), `permissions` (mã quyền), `user_roles` (gán nhiều role cho
một user), và `role_permissions` (gán nhiều permission cho một role). V3 chuyển
role cũ sang `user_roles`, sau đó bỏ cột `users.role`; V1/V2 không bị sửa.
Hiện có role `USER`, `ADMIN` và quyền `ACCOUNT_READ_SELF`, `ADMIN_ACCESS`.
Access JWT mang cả `roles` và `permissions`; các route quản trị kiểm tra quyền
`ADMIN_ACCESS`.

Quy tắc: service không đọc database của service khác, không dùng chung entity/domain model.
Cần dữ liệu service khác → gọi REST API của nó (JWT được chuyển tiếp tự động).

## Chạy local

Yêu cầu: JDK 25 (hoặc JDK 21 với `-Djava.version=21`), PostgreSQL 18. Không cần cài Maven (dùng `mvnw`).

```bash
# 1 lần: tạo database (Postgres cài trên máy)
psql -U postgres -f infrastructure/docker/postgres/init.sql

./mvnw install -DskipTests                               # build + cài các package dùng chung
./mvnw -pl services/outfit-service spring-boot:run       # chạy 1 service
./mvnw verify                                            # build + test toàn bộ
./mvnw -pl services/outfit-service -am package           # build riêng 1 service
```
Windows: dùng `mvnw.cmd` thay cho `./mvnw`.

### Chạy toàn bộ backend bằng Docker Compose

Trong `be/`, tạo `.env` từ `.env.example` nếu chưa có, điền các khóa cần dùng
và tạo khóa JWT một lần bằng `powershell -File scripts/generate-jwt-key.ps1`.
`WEB_ORIGIN`, `SHARE_BASE_URL`, `WEB_APP_URL` và `GOOGLE_REDIRECT_URI` phải dùng
`https://localhost:5173` khi frontend chạy bằng `npm run dev`.

```powershell
docker compose up -d --build
docker compose ps
docker compose logs -f auth-service
```

Compose chạy PostgreSQL và năm service trên cổng 8081–8085. `db-setup` chạy một lần
mỗi lần khởi động để tạo database còn thiếu trong volume PostgreSQL cũ; trạng thái
`Exited (0)` của container này là bình thường. Ảnh tủ đồ được giữ trong volume
`wardrobe_images`. Frontend chạy riêng trong `fe/web-app/` bằng `npm run dev`.
Nếu trước đó đang chạy Java service trực tiếp trên các cổng 8081–8085, dừng chúng
trước khi chạy Compose. Dùng `docker compose down` để dừng;
volume PostgreSQL và ảnh vẫn được giữ lại.

## outfit-service: AI và thời tiết

| Biến môi trường | Mặc định | Ý nghĩa |
|---|---|---|
| `AI_PROVIDER` | `auto` | Gemini chính, Gemini Flash Lite/Claude dự phòng; `none` chỉ dùng khi thử thuật toán không AI |
| `GEMINI_API_KEY` | trống | API key Gemini trên máy chủ, không đưa vào frontend |
| `ANTHROPIC_API_KEY` | trống | Tùy chọn để dùng Claude làm nguồn dự phòng |
| `AI_MODEL` | `claude-haiku-5-5` | Model Claude. `claude-opus-5-5` chọn tinh tế hơn nhưng đắt hơn ~40 lần |
| `BILLING_SERVICE_URL` | | Số lượt AI/ngày lấy theo gói từ billing-service (Free 3, Plus 20, Pro 100); billing lỗi → dùng mức Free. Hết lượt vẫn có gợi ý theo điểm |
| `AI_MONTHLY_BUDGET_USD` | `25` | Tổng chi phí AI mỗi tháng; chạm ngưỡng thì tự ngừng gọi AI |
| `WEATHER_LAT`, `WEATHER_LON` | TP.HCM | Vị trí lấy thời tiết (Open-Meteo, miễn phí, không cần key) |

Admin xem chi phí: `GET /api/admin/outfits/ai-usage` (cần JWT role ADMIN).
Admin xem danh sách người dùng thật qua `GET /api/admin/auth/users?page=0&size=20&search=...` (cần quyền `ADMIN_ACCESS`; không trả password hash).
Web dashboard hiện chỉ có API cho hai mục này; các mục quản trị còn lại hiển thị trạng thái chưa có dữ liệu thay vì số liệu giả.

**Cá nhân hoá:** `StyleProfile` học gu từng người từ 👍/👎, outfit đã lưu và số lần mặc mỗi món (cần ≥ 3 hành vi). Gu được cộng vào điểm thuật toán và gửi kèm cho Claude dưới dạng tóm tắt. Không huấn luyện lại model, không gửi dữ liệu người dùng khác.

## Xác thực JWT

Auth service phát access token ký RS256 và công bố public keys tại
`/.well-known/jwks.json`. Mỗi service kiểm tra chữ ký từ JWKS và kiểm tra claim
`iss` bằng `JWT_ISSUER`; private key chỉ nằm ở auth service. Với Docker Compose,
`JWT_JWK_SET_URI` trỏ tới `http://auth-service:8081/.well-known/jwks.json`.
Chạy local ngoài Docker thì dùng URI `http://localhost:8081/.well-known/jwks.json`.
Các service kiểm tra `sid` với auth service qua `SESSION_VALIDATION_URI` trên mỗi request
có JWT từ cookie HttpOnly hoặc Bearer token; phiên đã thu hồi bị từ chối ngay,
kể cả access token chưa hết 30 phút. Web dùng cookie `access_token` trên `/api` và
`refresh_token` trên `/api/public/auth`; request ghi dữ liệu bằng cookie phải có
`Origin` trùng `WEB_ORIGIN`. Native và các service nội bộ vẫn có thể gửi Bearer header.
Tạo khóa một lần bằng `powershell -File scripts/generate-jwt-key.ps1` trước khi
chạy auth service hoặc Docker Compose. File `.keys/jwt-private.pem` đã được
gitignore; không đưa private key vào repository. JDK 21 dùng được khi build với
`mvnw.cmd verify -Djava.version=21`.

## Google đăng nhập và admin đầu tiên

Điền `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` trong
`be/.env.local`. Khi chạy `mvnw.cmd -pl services/auth-service spring-boot:run`,
profile `local` tự đọc file này; khởi động lại service sau khi đổi giá trị.
Biến môi trường đã đặt trong terminal vẫn có ưu tiên cao hơn `.env.local`.
Trong Google Cloud Console, đăng ký chính xác redirect URI, ví dụ
`http://localhost:5173/api/public/auth/google/callback` khi chạy web-app qua Vite.
`ADMIN_BOOTSTRAP_EMAIL` là email admin đầu tiên: tài khoản chỉ được nâng quyền khi
đăng nhập Google với email đã xác minh và Google quản lý email đó (Gmail/Workspace),
và hệ thống chưa có admin. Để trống biến này nếu chưa cần tạo admin. Sau khi đã có
admin, biến môi trường không cấp thêm quyền cho tài khoản khác.

## billing-service: gói thuê bao

| Gói | Giá | Tủ đồ | AI gợi ý/ngày | Riêng Pro |
|---|---|---|---|---|
| Free | 0đ | 50 món | 3 | |
| Plus | 49.000đ/tháng · 499.000đ/năm | 300 món | 20 | |
| Pro | 79.000đ/tháng · 799.000đ/năm | không giới hạn | 100 | thống kê tủ đồ, chi phí mỗi lần mặc, lịch mặc, thử đồ 3D |

Giá và quyền lợi nằm trong `billing-service/.../domain/model/Plan.java`.

- Service khác lấy giới hạn của người dùng: `GET /api/app/billing/me` (chuyển tiếp JWT). wardrobe-service dùng `limits.wardrobeItems`,
  outfit-service dùng `limits.aiSuggestionsPerDay`, tính năng Pro kiểm tra `features`.
- Thanh toán: `PAYMENT_GATEWAY=fake` (mặc định, bấm là thành công, chỉ dùng khi dev) hoặc `payos`
  (cần `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` từ https://my.payos.vn).
  Khai báo webhook `https://<domain>/api/public/billing/payos/webhook` trong trang PayOS.
- Gói kích hoạt khi webhook tới **hoặc** khi người dùng quay lại trang kết quả (hỏi trạng thái từ PayOS), chỉ một lần.
- Đổi gói khi còn hạn: thời gian còn lại quy ra tiền rồi đổi sang thời gian của gói mới, không mất tiền.

## wardrobe-service: tủ đồ, quét ảnh nhiều món

- `POST /api/app/wardrobe/scans` (1–10 ảnh JPEG/PNG) → chạy nền: chuẩn hoá ảnh (xoay theo EXIF, cạnh dài ≤ 1568px)
  → AI tìm từng món kèm khung → `GarmentSelection` lọc → cắt ảnh từng món → lưu → món `PENDING_REVIEW`. Ảnh gốc không lưu.
- Giới hạn số món theo gói: hỏi billing-service `GET /api/app/billing/me` (lỗi → mức Free 50).

| Biến môi trường | Mặc định | Ý nghĩa |
|---|---|---|
| `AI_PROVIDER` | `auto` | Gemini vision chính, Gemini Flash Lite/Claude dự phòng; `none` chỉ dùng thử với dữ liệu giả |
| `GEMINI_API_KEY` | trống | Cần để nhận diện ảnh thật bằng Gemini |
| `ANTHROPIC_API_KEY` | trống | Tùy chọn để dùng Claude khi Gemini không khả dụng |
| `AI_MODEL` | `claude-haiku-5-5` | Model Claude |
| `IMAGE_STORAGE` | `local` | `cloudinary` khi deploy (cần `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) |
| `IMAGE_DIR` | `./data/wardrobe-images` | Thư mục ảnh khi lưu local |
| `PUBLIC_BASE_URL` | `http://localhost:5173` | Địa chỉ web-app, dùng tạo link ảnh lưu local |
| `BILLING_SERVICE_URL` | | billing-service, để biết giới hạn số món theo gói |
