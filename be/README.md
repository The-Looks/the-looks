# THE LOOKS · Backend (Maven microservices)

| Thư mục | Nội dung | Cổng | Phụ trách |
|---|---|---|---|
| `services/identity-service` | Đăng ký, đăng nhập, phát JWT, phân quyền | 8081 | Member 3 (Phát) |
| `services/wardrobe-service` | Tủ đồ số: upload, AI nhận diện, xác nhận/sửa/xoá | 8082 | Member 1 |
| `services/outfit-service` | AI gợi ý theo dịp + Quick Pick | 8083 | Member 2 (Tuấn) |
| `services/voting-service` | Ask Friends: bình chọn A/B qua link | 8084 | Member 3 (Phát) |
| `packages/contracts` | OpenAPI của từng service — **sửa ở đây trước khi code** | | |
| `packages/security` | Xác thực JWT dùng chung + chuyển tiếp token khi gọi service khác | | |
| `packages/observability` | Correlation ID (header `X-Correlation-Id`, có trong log) | | |
| `infrastructure/docker` | Script tạo database cho từng service | | |

## Layer trong mỗi service

```
domain/          model, exception, service — Java thuần, không Spring/JPA
application/     usecase (interface), port/out (interface ra ngoài), service (cài đặt use case)
api/             controller, dto — REST + validation
infrastructure/  persistence (JPA), client (gọi service khác), ai, config
```
`ArchitectureTest` trong mỗi service kiểm tra các ranh giới này trên CI.

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

Identity service phát access token ký RS256 và công bố public keys tại
`/.well-known/jwks.json`. Mỗi service kiểm tra chữ ký từ JWKS và kiểm tra claim
`iss` bằng `JWT_ISSUER`; private key chỉ nằm ở identity service. Với Docker Compose,
`JWT_JWK_SET_URI` trỏ tới `http://identity-service:8081/.well-known/jwks.json`.
Chạy local ngoài Docker thì dùng URI `http://localhost:8081/.well-known/jwks.json`.
Endpoint JWKS và bộ phát token RS256 cần được triển khai trong identity service trước
khi có thể xác thực access token.
