# THE LOOKS · Backend (Maven microservices)

| Thư mục | Nội dung | Cổng | Phụ trách |
|---|---|---|---|
| `services/identity-service` | Đăng ký, đăng nhập, phát JWT, phân quyền | 8081 | Member 3 (Phát) |
| `services/wardrobe-service` | Tủ đồ số: upload, AI nhận diện, xác nhận/sửa/xoá | 8082 | Member 1 |
| `services/outfit-service` | AI gợi ý theo dịp + Quick Pick | 8083 | Member 2 (Tuấn) |
| `services/voting-service` | Ask Friends: bình chọn A/B qua link | 8084 | Member 3 (Phát) |
| `services/billing-service` | Gói Free / Plus / Pro, thanh toán PayOS | 8085 | Member 2 (Tuấn) |
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

## billing-service: gói thuê bao

| Gói | Giá | Tủ đồ | AI gợi ý/ngày | Riêng Pro |
|---|---|---|---|---|
| Free | 0đ | 50 món | 3 | |
| Plus | 39.000đ/tháng · 390.000đ/năm | 300 món | 20 | |
| Pro | 79.000đ/tháng · 790.000đ/năm | không giới hạn | 100 | thống kê tủ đồ, chi phí mỗi lần mặc, lịch mặc, thử đồ 3D |

Giá và quyền lợi nằm trong `billing-service/.../domain/model/Plan.java`.

- Service khác lấy giới hạn của người dùng: `GET /api/app/billing/me` (chuyển tiếp JWT). wardrobe-service dùng `limits.wardrobeItems`,
  outfit-service dùng `limits.aiSuggestionsPerDay`, tính năng Pro kiểm tra `features`.
- Thanh toán: `PAYMENT_GATEWAY=fake` (mặc định, bấm là thành công, chỉ dùng khi dev) hoặc `payos`
  (cần `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` từ https://my.payos.vn).
  Khai báo webhook `https://<domain>/api/public/billing/payos/webhook` trong trang PayOS.
- Gói kích hoạt khi webhook tới **hoặc** khi người dùng quay lại trang kết quả (hỏi trạng thái từ PayOS), chỉ một lần.
- Đổi gói khi còn hạn: thời gian còn lại quy ra tiền rồi đổi sang thời gian của gói mới, không mất tiền.
