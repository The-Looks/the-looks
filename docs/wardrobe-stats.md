# Thống kê tủ đồ Pro (1.6)

Nhánh dựa trên `feature/wardrobe-search` (1.3), dùng API wear-summary đã thêm vào outfit-service.

- Web: `/wardrobe/stats`, mở từ nút Thống kê Pro trên trang Tủ đồ.
- API: `GET /api/app/wardrobe/stats`; backend kiểm tra quyền `WARDROBE_STATS` qua billing bằng JWT người dùng trước khi đọc dữ liệu. Không suy quyền từ tên gói ở FE.
- Thiếu quyền: 403. Billing/lịch sử mặc không tải được: 503. Response thành công có `Cache-Control: no-store`.
- Chỉ tính món CONFIRMED của chủ JWT. Màu được trim, chuyển chữ thường và loại nhãn trùng trên cùng món; thiếu loại/màu dùng UNKNOWN. Món nhiều màu được tính vào mỗi màu.
- Tỉ lệ đã mặc = số món có lịch sử mặc / số món đã xác nhận, làm tròn 1 số thập phân. Tủ trống trả 0 và biểu đồ rỗng.
- Ít dùng gồm món chưa từng mặc và món có lần mặc cuối cách ít nhất 30 ngày (đủ 30 x 24 giờ); danh sách ưu tiên chưa mặc, rồi lần mặc cũ nhất. Trả 10 món đầu và tổng số để giao diện không nhầm đó là toàn bộ.
- Lịch sử của món đã xoá hoặc ngoài tủ không ảnh hưởng số liệu. Lượt mặc chỉ được ghi khi dùng Mặc bộ này.

Triển khai outfit-service của 1.3 trước, rồi wardrobe-service và FE. Không cần migration mới. Test bao gồm quyền Pro, lỗi phụ thuộc, quyền sở hữu, nhiều màu, tủ trống, ranh giới 30 ngày, giới hạn danh sách và trạng thái Free/Pro trên FE.
