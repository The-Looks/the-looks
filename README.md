# THE LOOKS

*Wear More. Buy Smarter.*

| Thư mục | Nội dung |
|---|---|
| `backend/` | Spring Boot 4 (Java 25), modular monolith — xem [ADR 0001](docs/adr/0001-modular-monolith-hexagonal.md) |
| `apps/mobile/` | App người dùng, React Native + Expo |
| `apps/admin-web/` | Admin web, React + Vite |
| `apps/voting-web/` | Trang bình chọn cho bạn bè (không cần đăng nhập), React + Vite |
| `contracts/openapi.yaml` | Hợp đồng API — sửa ở đây trước khi code |
| `infra/` | Docker Compose cho máy dev (Postgres, MinIO) |
| `docs/adr/` | Các quyết định kiến trúc |

## Yêu cầu

JDK 25, Node 24, Docker Desktop.

## Chạy local

```bash
docker compose -f infra/docker-compose.yml up -d   # Postgres + MinIO
cd backend && ./gradlew bootRun                     # http://localhost:8080/actuator/health
cd apps/voting-web && npm install && npm run dev    # tương tự cho admin-web
cd apps/mobile && npm install --legacy-peer-deps && npx expo start
```

## Quy trình làm việc

- Nhánh `feature/<tên>` → Pull Request → review → merge vào `main`. Không push thẳng `main`.
- Commit theo [Conventional Commits](https://www.conventionalcommits.org): `feat(wardrobe): ...`, `fix(voting): ...`.
- Đổi API: sửa `contracts/openapi.yaml` trong cùng PR.
- Quyết định kiến trúc mới: thêm file `docs/adr/NNNN-ten.md`.
- CI (`.github/workflows/ci.yml`) phải xanh trước khi merge.
