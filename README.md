# THE LOOKS

*Wear More. Buy Smarter.*

| Thư mục | Nội dung |
|---|---|
| `be/` | **Backend** — Maven microservices, Spring Boot 4 (Java 25): identity, wardrobe, outfit, voting — xem [be/README.md](be/README.md) và [ADR 0003](docs/adr/0003-maven-microservices.md) |
| `fe/web-app/` | **Frontend** — app người dùng chính, React + Vite + TypeScript, PWA — xem [ADR 0004](docs/adr/0004-web-app-first.md) |
| `fe/mobile/` | App mobile React Native + Expo — **tạm dừng**, làm sau khi có người dùng thật |
| `fe/admin-web/` | **Frontend** — admin web, React + Vite |
| `fe/voting-web/` | **Frontend** — trang bình chọn cho bạn bè (không cần đăng nhập), React + Vite |
| `docs/adr/` | Các quyết định kiến trúc |
| `docs/viec-thu-cong.md` | **Việc cần làm bằng tay** (tài khoản, khoá bí mật, deploy, việc của nhóm) |

## Yêu cầu

JDK 25, Node 24, PostgreSQL 18 (cài trực tiếp hoặc qua Docker). Không cần cài Maven: dùng `./mvnw` có sẵn trong `be/`.

## Chạy local

```bash
cd be && ./mvnw install -DskipTests              # lần đầu; xem be/README.md để tạo database
cd be && ./mvnw -pl services/outfit-service spring-boot:run   # chạy 1 service (cổng 8081–8084)
cd fe/web-app && npm install && npm run dev        # app chính, http://localhost:5173 (xem fe/web-app/README.md)
cd fe/voting-web && npm install && npm run dev      # tương tự cho admin-web
```

## Quy trình làm việc

- Nhánh `feature/<tên>` → Pull Request → review → merge vào `main`. Không push thẳng `main`.
- Commit theo [Conventional Commits](https://www.conventionalcommits.org): `feat(wardrobe): ...`, `fix(voting): ...`.
- Đổi API: sửa file `be/packages/contracts/src/main/resources/openapi/<service>-api.yaml` trong cùng PR.
- Quyết định kiến trúc mới: thêm file `docs/adr/NNNN-ten.md`.
- CI (`.github/workflows/ci.yml`) phải xanh trước khi merge.
