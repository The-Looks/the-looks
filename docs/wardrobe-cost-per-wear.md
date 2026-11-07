# Chi phí mỗi lần mặc Pro (1.7)

Phụ thuộc 1.4 (giá mua) và API wear-summary của 1.3 (outfit-service đã cung cấp số lần mặc theo món).

- `GET /api/app/wardrobe/items/{itemId}/cost-per-wear`: chỉ món CONFIRMED của chủ JWT.
- `GET /api/app/wardrobe/cost-per-wear`: tối đa 10 món đã xác nhận, ưu tiên chi phí cao nhất; tổng số trong totalItems. Chỉ gọi outfit một lần cho cả danh sách.
- Backend cần quyền COST_PER_WEAR thực tế từ billing, độc lập với WARDROBE_STATS; response không cache. Thiếu quyền 403, không sở hữu 404, chưa xác nhận 409, lỗi billing/lịch sử mặc 503.
- Công thức BigDecimal: giá mua / số lần mặc, làm tròn HALF_UP tới 2 số thập phân VND. Ví dụ 300000 / 10 = 30000.00.
- Thiếu giá: MISSING_PRICE, costPerWear = null. Có giá nhưng 0 lần mặc: NEVER_WORN, costPerWear = null. Quà tặng giá 0 và đã mặc: CALCULATED, costPerWear = 0.
- Số lượt mặc lấy từ WearLog, chỉ ghi khi dùng Mặc bộ này. Không tăng lượt khi mở trang hay lưu outfit.
- Giao diện có ở chi tiết món và trang thống kê. Sửa giá hoặc ghi lượt mặc sẽ làm mới chi phí; lỗi không hiển thị số liệu cũ như kết quả hiện tại.

Không cần migration mới ngoài V3 của 1.4. Triển khai outfit-service có wear-summary trước, rồi wardrobe-service và FE.

Các nhánh 1.2–1.7 được gom vào feature/wardrobe-integration. main giữ nguyên. Chạy backend Maven test (đặt WARDROBE_TEST_DB_URL cho test PostgreSQL), sau đó npm run test/build/lint trong fe/web-app. Muốn chạy Docker bản tích hợp, build lại từ be của nhánh tích hợp với file .env local.
