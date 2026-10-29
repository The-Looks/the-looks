# ADR 0001: Backend là modular monolith, mỗi module theo Hexagonal

- Trạng thái: **Đã thay thế** bởi [ADR 0003](0003-maven-microservices.md) (2026-10-29)
- Ngày: 2026-10-21

## Bối cảnh

4 tính năng đầu (Tủ đồ số, Gợi ý theo dịp, Quick Pick, Ask Friends) thì 3 tính năng phụ thuộc AI.
Nhà cung cấp AI và nơi lưu ảnh gần như chắc chắn sẽ thay đổi. Team nhỏ, chưa có tải lớn.

## Quyết định

- Một ứng dụng Spring Boot (Java 25, Boot 4), chia module theo nghiệp vụ: `identity`, `wardrobe`, `outfit`, `voting`, cộng `shared`.
- Mỗi module theo Hexagonal:
  - `domain/` — Java thuần, không import Spring/JPA
  - `application/port/in` (use case), `application/port/out` (repository, AI, storage), `application/service`
  - `adapter/in/web`, `adapter/out/persistence`, `adapter/out/ai`, `adapter/out/storage`
- Module chỉ giao tiếp qua API công khai hoặc domain event (Spring Modulith, event lưu bằng JDBC).
- Mỗi module sở hữu bảng riêng, tiền tố theo tên module (`wardrobe_*`...). Không join chéo module.
- Ranh giới được kiểm tra bằng `ArchitectureTests` (Spring Modulith `verify()` + ArchUnit) trên CI.

## Hệ quả

- Đổi nhà cung cấp AI = thêm adapter mới, không sửa domain/use case.
- Tách một module thành microservice sau này = cắt package + bảng của nó.
- Đổi lại: mỗi tính năng nhiều file hơn layered (mapper giữa domain ↔ JPA entity ↔ DTO).
- Không dùng microservices, message broker cho tới khi có tải hoặc team đủ lớn để cần.
