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

## outfit-service: AI và thời tiết

| Biến môi trường | Mặc định | Ý nghĩa |
|---|---|---|
| `AI_PROVIDER` | `none` | `claude` để bật AI chọn/xếp hạng gợi ý (cần `ANTHROPIC_API_KEY`); `none` = xếp theo điểm thuật toán |
| `AI_MODEL` | `claude-haiku-5-5` | Model Claude. `claude-opus-5-5` chọn tinh tế hơn nhưng đắt hơn ~40 lần |
| `AI_DAILY_LIMIT` | `10` | Số lượt gọi AI mỗi người mỗi ngày; hết lượt vẫn có gợi ý theo điểm |
| `AI_MONTHLY_BUDGET_USD` | `25` | Tổng chi phí AI mỗi tháng; chạm ngưỡng thì tự ngừng gọi AI |
| `WEATHER_LAT`, `WEATHER_LON` | TP.HCM | Vị trí lấy thời tiết (Open-Meteo, miễn phí, không cần key) |

Admin xem chi phí: `GET /api/admin/outfits/ai-usage` (cần JWT role ADMIN).

**Cá nhân hoá:** `StyleProfile` học gu từng người từ 👍/👎, outfit đã lưu và số lần mặc mỗi món (cần ≥ 3 hành vi). Gu được cộng vào điểm thuật toán và gửi kèm cho Claude dưới dạng tóm tắt. Không huấn luyện lại model, không gửi dữ liệu người dùng khác.
