# Tìm và lọc tủ đồ (1.3)

- Web: `/wardrobe`; bộ lọc, sắp xếp và trang nằm trên query string.
- API mới: `GET /api/app/wardrobe/items/search` trả `{ items, total, page, size }`.
- API `GET /api/app/wardrobe/items` cũ vẫn trả mảng để outfit-service và các màn khác tiếp tục hoạt động.
- Các bộ lọc kết hợp bằng AND: `category`, `status`, `color`, `season`, `style`, `q`.
- Màu/phong cách khớp nhãn đầy đủ, không phân biệt hoa thường; mùa bao gồm món dùng được mọi mùa.
- `sort=NEWEST` (mặc định) hoặc `LEAST_RECENTLY_WORN`; món chưa mặc đứng trước, sau đó lần mặc cũ nhất. ID làm khoá phụ để phân trang ổn định.
- `page` bắt đầu từ 0; `size` từ 1 đến 100 (web cho chọn 12/24/48/100).
- Lịch sử lấy từ `GET /api/app/outfits/wear-summary`, chỉ tổng hợp chủ JWT, không gọi ngược wardrobe-service. Không lấy được lịch sử thì trả 503 thay vì báo sai rằng mọi món chưa mặc.

## Triển khai và kiểm tra

Triển khai outfit-service với endpoint wear-summary trước, rồi wardrobe-service và FE.
`OUTFIT_SERVICE_URL` của wardrobe trỏ tới outfit-service; Docker Compose và Render Blueprint đã có giá trị tương ứng.

Test repository dùng PostgreSQL tạm và schema riêng: đặt `WARDROBE_TEST_DB_URL` trước khi chạy Maven test. Test bao gồm từng bộ lọc, kết hợp, quyền sở hữu, hơn 50 món, trang rỗng, thứ tự và lịch sử mặc.
