# THE LOOKS

*Wear More. Buy Smarter.*

| Thư mục | Nội dung |
|---|---|
| `be/` | **Backend** — Spring Boot 4 (Java 25), modular monolith — xem [ADR 0001](docs/adr/0001-modular-monolith-hexagonal.md). `be/docker-compose.yml`: Postgres + MinIO cho máy dev |
| `fe/mobile/` | **Frontend** — app người dùng, React Native + Expo |
| `fe/admin-web/` | **Frontend** — admin web, React + Vite |
| `fe/voting-web/` | **Frontend** — trang bình chọn cho bạn bè (không cần đăng nhập), React + Vite |
| `contracts/openapi.yaml` | Hợp đồng API giữa fe và be — sửa ở đây trước khi code |
| `docs/adr/` | Các quyết định kiến trúc |

## Yêu cầu

JDK 25, Node 24, PostgreSQL 18 (cài trực tiếp hoặc qua Docker). Không cần cài Maven: dùng `./mvnw` có sẵn trong `be/`.

## Chạy local

```bash
cd be && ./mvnw spring-boot:run                  # cần Postgres (cài sẵn, hoặc docker compose up -d); http://localhost:8080/actuator/health
cd fe/voting-web && npm install && npm run dev      # tương tự cho admin-web
cd fe/mobile && npm install --legacy-peer-deps && npx expo start
```

## Quy trình làm việc

- Nhánh `feature/<tên>` → Pull Request → review → merge vào `main`. Không push thẳng `main`.
- Commit theo [Conventional Commits](https://www.conventionalcommits.org): `feat(wardrobe): ...`, `fix(voting): ...`.
- Đổi API: sửa `contracts/openapi.yaml` trong cùng PR.
- Quyết định kiến trúc mới: thêm file `docs/adr/NNNN-ten.md`.
- CI (`.github/workflows/ci.yml`) phải xanh trước khi merge.
