# THE LOOKS – Trang bình chọn cho bạn bè (ReactJS)

Màn 39 "WEB Guest Bình chọn" (desktop 1440×900, responsive xuống mobile). Không cần đăng nhập, bình chọn ẩn danh.

```
npm install
npm run dev     # http://localhost:5173
```

Luồng: chọn Set A/B → "Gửi bình chọn" → hiện kết quả (Set A 67% / Set B 33%, dữ liệu mẫu).
Khi có backend Spring Boot: thay `RESULT` và `SETS` trong `src/features/voting/VotePage.jsx` bằng API theo mã link `/v/:id`.
