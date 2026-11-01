# THE LOOKS · Backend (Maven microservices)

| Thư mục | Nội dung | Cổng | Phụ trách |
|---|---|---|---|
| `services/auth-service` | Đăng ký, đăng nhập, phát JWT, phân quyền | 8081 | Member 3 (Phát) |
| `services/wardrobe-service` | Tủ đồ số: upload, AI nhận diện, xác nhận/sửa/xoá | 8082 | Member 1 |
| `services/outfit-service` | AI gợi ý theo dịp + Quick Pick | 8083 | Member 2 (Tuấn) |
| `services/voting-service` | Ask Friends: bình chọn A/B qua link | 8084 | Member 3 (Phát) |
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

Yêu cầu: JDK 25, PostgreSQL 18. Không cần cài Maven (dùng `mvnw`).

```bash
# 1 lần: tạo database (Postgres cài trên máy)
psql -U postgres -f infrastructure/docker/postgres/init.sql

./mvnw install -DskipTests                               # build + cài các package dùng chung
./mvnw -pl services/outfit-service spring-boot:run       # chạy 1 service
./mvnw verify                                            # build + test toàn bộ
./mvnw -pl services/outfit-service -am package           # build riêng 1 service
```
Windows: dùng `mvnw.cmd` thay cho `./mvnw`.

## Xác thực JWT

Auth service phát access token ký RS256 và công bố public keys tại
`/.well-known/jwks.json`. Mỗi service kiểm tra chữ ký từ JWKS và kiểm tra claim
`iss` bằng `JWT_ISSUER`; private key chỉ nằm ở auth service. Với Docker Compose,
`JWT_JWK_SET_URI` trỏ tới `http://auth-service:8081/.well-known/jwks.json`.
Chạy local ngoài Docker thì dùng URI `http://localhost:8081/.well-known/jwks.json`.
Các service kiểm tra `sid` với auth service qua `SESSION_VALIDATION_URI` trên mỗi request
có Bearer token; phiên đã thu hồi bị từ chối ngay, kể cả access token chưa hết 30 phút.
Tạo khóa một lần bằng `powershell -File scripts/generate-jwt-key.ps1` trước khi
chạy auth service hoặc Docker Compose. File `.keys/jwt-private.pem` đã được
gitignore; không đưa private key vào repository. JDK 21 dùng được khi build với
`mvnw.cmd verify -Djava.version=21`.

## Google đăng nhập và admin đầu tiên

Điền `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` trong `.env`.
Trong Google Cloud Console, đăng ký chính xác redirect URI, ví dụ
`http://localhost:5173/api/public/auth/google/callback` khi chạy web-app qua Vite.
`ADMIN_BOOTSTRAP_EMAIL` là email admin đầu tiên: tài khoản chỉ được nâng quyền khi
đăng nhập Google với email đã xác minh và Google quản lý email đó (Gmail/Workspace),
và hệ thống chưa có admin. Để trống biến này nếu chưa cần tạo admin. Sau khi đã có
admin, biến môi trường không cấp thêm quyền cho tài khoản khác.
