# Phân công công việc

Cập nhật: 01/11/2026 · Giai đoạn MVP: T11–T12/2026 · Ra mắt giới hạn cho sinh viên FPT: T1/2027

Mỗi người sở hữu trọn phần của mình: backend, màn hình web và test. Ai cần đổi API của người khác thì sửa
`be/packages/contracts/.../*-api.yaml` trong PR và nhờ chủ phần đó review.

## Tóm tắt

| Người | Phụ trách chính | Service / thư mục |
|---|---|---|
| **Thạch** (Member 1, `thachhn404`) | Tủ đồ số, onboarding, affiliate | `wardrobe-service`, `fe/web-app/src/features/wardrobe` |
| **Tuấn** (Member 2, `tennyhoang`) | Gợi ý outfit, Quick Pick, gói thuê bao, tính năng Pro, deploy | `outfit-service`, `billing-service`, `fe/web-app/src/features/{outfit,billing}` |
| **Phát** (Member 3, `DoTruongPhat`) | Đăng nhập, phân quyền, Ask Friends, admin, quyền riêng tư | `auth-service`, `voting-service`, `fe/web-app/src/features/{auth,voting,profile}`, `fe/admin-web`, `fe/voting-web` |

---

## Thạch (Member 1) · Tủ đồ số

| # | Việc | Hạn | Ghi chú |
|---|---|---|---|
| 1.1 | **Review và nhận lại wardrobe-service** (PR #8, #10) | 08/11 | Code đã chạy được; đọc hiểu, sửa theo ý mình, từ giờ là chủ phần này |
| 1.2 | Tạo tài khoản **Cloudinary**, thử upload thật | 15/11 | Xem `docs/viec-thu-cong.md` |
| 1.3 | Thử **AI nhận diện** với 300–500 ảnh quần áo thật, ghi tỉ lệ nhận đúng / cắt đúng | 22/11 | Cần key Anthropic (`AI_PROVIDER=claude`); chỉnh prompt nếu sai nhiều |
| 1.4 | **Onboarding**: chọn phong cách, màu yêu thích, thêm 3–5 món đầu, có outfit đầu tiên ngay | 29/11 | Theo kế hoạch xử lý rủi ro số 3 (nhập tủ đồ mất công) |
| 1.5 | Thêm **giá mua** cho món đồ (API + màn sửa món) | 06/12 | Tuấn dùng để tính chi phí mỗi lần mặc (việc 2.4) |
| 1.6 | **Affiliate** (doanh thu luồng 2): danh mục sản phẩm chọn lọc, link mua có mã affiliate, đếm lượt bấm, nhập hoa hồng | 20/12 | Cả nhóm chọn nền tảng affiliate trước (việc 4.3) |

## Tuấn (Member 2) · Gợi ý outfit, gói thuê bao, deploy

| # | Việc | Hạn | Ghi chú |
|---|---|---|---|
| 2.1 | Merge các PR của mình theo thứ tự (#4 → #5 → #9, #6 → #8 → #10) | 08/11 | Cần 1 người review mỗi PR |
| 2.2 | **Đẩy file CI**, bật bảo vệ nhánh `main`, thêm `CODEOWNERS` | 08/11 | Xem `docs/viec-thu-cong.md` |
| 2.3 | Bỏ tủ đồ giả (`FakeWardrobeReader`) trong outfit-service, nối tủ đồ thật | 15/11 | Sau khi #10 merge |
| 2.4 | **Chi phí mỗi lần mặc** (Pro): giá mua ÷ số lần mặc | 13/12 | Cần việc 1.5 |
| 2.5 | **Thống kê tủ đồ** (Pro): món theo loại/màu, món lâu chưa mặc, tỉ lệ đồ được mặc | 13/12 | Dùng `WearLog` có sẵn |
| 2.6 | **Lịch mặc** (Pro): lên lịch outfit theo ngày, đánh dấu đã mặc | 20/12 | |
| 2.7 | **Deploy**: Vercel (web), Render + Neon (backend), API gateway, biến môi trường, tên miền | 27/12 | Bản demo web đã sẵn sàng deploy |
| 2.8 | Tài khoản **Anthropic** và **PayOS**, theo dõi chi phí AI hằng tuần | 15/11 (Anthropic) · 13/12 (PayOS) | Ngân sách AI 25 USD/tháng |

## Phát (Member 3) · Đăng nhập, Ask Friends, admin

| # | Việc | Hạn | Ghi chú |
|---|---|---|---|
| 3.1 | Review **PR #11** (chống spam bình chọn + test) | 08/11 | |
| 3.2 | Quyết định **cache kiểm tra phiên** (giữ "thu hồi là chặn ngay" hay cache vài giây) | 08/11 | Xem mô tả PR #11 |
| 3.3 | Thêm **test cho auth-service**: đăng ký trùng, sai mật khẩu, refresh token bị dùng lại, JWT hết hạn | 15/11 | Bước 9 trong kế hoạch của Phát |
| 3.4 | Cấu hình **Google Login** thật (Google Cloud Console) | 15/11 | |
| 3.5 | **Admin web nối API thật**: danh sách người dùng, khoá/mở tài khoản, xem doanh thu gói và chi phí AI | 06/12 | Có sẵn quyền `ADMIN`; outfit có `/api/admin/outfits/ai-usage` |
| 3.6 | **Báo cáo và phản hồi**: nút báo cáo bình chọn vi phạm, gửi góp ý trong app; admin xử lý | 13/12 | Theo quy trình hỗ trợ khách hàng |
| 3.7 | **Quyền riêng tư**: màn xin đồng ý, xoá tài khoản kèm dữ liệu ở mọi service | 20/12 | Phát làm ở auth + điều phối; mỗi service thêm API xoá dữ liệu của người dùng (Thạch: wardrobe, Tuấn: outfit + billing) |
| 3.8 | **Hồ sơ cá nhân**: tên, ảnh đại diện, thành phố (để lấy thời tiết đúng nơi) | 20/12 | Báo Tuấn khi có thành phố để outfit dùng |

## Cả nhóm

| # | Việc | Hạn |
|---|---|---|
| 4.1 | Review PR của nhau: mỗi PR ít nhất 1 người duyệt trong 48 giờ | Liên tục |
| 4.2 | Chốt **giá gói** Plus/Pro | 15/11 |
| 4.3 | Chọn **nền tảng affiliate** và đối tác đầu tiên | 22/11 |
| 4.4 | Viết **chính sách quyền riêng tư** (nội dung) | 06/12 |
| 4.5 | Cho **≥ 20 người dùng thử**, sửa ≥ 3 vấn đề | 20/12 |
| 4.6 | Sửa **tài liệu nộp** theo hướng "web trước, mobile sau" | 15/11 |

## Để sau MVP

- **Phí giao dịch** trên đơn mua qua đối tác (doanh thu luồng 3): cần có đối tác bán trực tiếp trước.
- **Thử đồ 3D**: nghiên cứu.
- **App mobile** (React Native): làm khi đã có người dùng thật.
- **Bình luận** trong bình chọn.

## Quy tắc chung

- Mỗi việc là một nhánh `feature/<tên>` → Pull Request → 1 người review → merge. Không push thẳng `main`.
- Xong việc = có test + CI xanh + chạy được trên web. Đổi API thì sửa file contract trong cùng PR.
- Bị chặn quá 1 ngày vì chờ người khác: báo ngay trong nhóm Zalo.
- Đổi người phụ trách hoặc đổi hạn: sửa file này trong PR.
