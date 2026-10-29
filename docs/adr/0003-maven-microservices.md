# ADR 0003: Backend chuyển sang Maven microservices

- Trạng thái: Đã chấp nhận
- Ngày: 2026-10-29
- Thay thế: [ADR 0001](0001-modular-monolith-hexagonal.md)

## Bối cảnh

Nhóm thống nhất dùng cấu trúc Maven multi-module dạng microservices theo mẫu tham khảo của nhóm,
mỗi thành viên sở hữu trọn một hoặc hai service:

| Service | Phụ trách | Cổng |
|---|---|---|
| identity-service | Member 3 (Phát) | 8081 |
| wardrobe-service | Member 1 | 8082 |
| outfit-service | Member 2 (Tuấn) | 8083 |
| voting-service | Member 3 (Phát) | 8084 |

## Quyết định

- `be/pom.xml` là parent (packaging `pom`); mỗi service là một ứng dụng Spring Boot riêng trong `be/services/`.
- Package dùng chung trong `be/packages/`:
  - `contracts` — OpenAPI của từng service (contract-first).
  - `security` — mọi service là OAuth2 resource server, xác thực JWT do identity-service phát;
    tự chuyển tiếp JWT người dùng khi gọi service khác.
  - `observability` — correlation ID (`X-Correlation-Id`) xuyên suốt các service, có trong log.
- Layer trong mỗi service: `domain` (model, exception, service) → `application` (usecase, port/out, service)
  → `api` (controller, dto) / `infrastructure` (persistence, client, ai, config).
  `ArchitectureTest` (ArchUnit) trong mỗi service kiểm tra trên CI.
- Mỗi service một database riêng (`thelooks_<service>`). Không đọc database của service khác,
  không dùng chung entity/domain model; cần dữ liệu thì gọi REST API của service đó.
- Gọi giữa service đồng bộ qua REST (RestClient, timeout 2s/5s). Service phụ thuộc lỗi → trả 503 rõ ràng.

## Hệ quả

- Mỗi người build/chạy/test service của mình độc lập: `./mvnw -pl services/<x>-service -am package`.
- **Chi phí vận hành tăng**: 4 tiến trình Spring Boot (~250–400 MB RAM mỗi cái). Kế hoạch ngân sách hiện tính
  1 máy chủ 1 CPU/2 GB — vừa sát, cần theo dõi; có thể gộp chạy chung máy, tách database theo schema nếu thiếu.
- Frontend gọi 4 cổng khác nhau → cần **API gateway / reverse proxy** (một địa chỉ duy nhất) trước khi ra mắt.
- Chưa dùng Kafka/message broker, Kubernetes, Terraform: thêm khi có nhu cầu thật (event bất đồng bộ, nhiều máy chủ).
- JWT ký HMAC dùng chung secret giữa các service; chuyển sang RSA + JWKS của identity-service khi deploy nhiều nơi.
