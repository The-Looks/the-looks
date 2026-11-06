# Phân công công việc

Cập nhật: 01/11/2026 · Giai đoạn MVP: T11–T12/2026 · Ra mắt giới hạn cho sinh viên FPT: T1/2027

Mỗi người sở hữu trọn phần của mình: backend, màn hình web và test. Ai cần đổi API của người khác thì sửa
`be/packages/contracts/.../*-api.yaml` trong PR và nhờ chủ phần đó review.

## Tóm tắt

| Người | Phụ trách chính | Service / thư mục |
|---|---|---|
| **Thạch** (Member 1, `thachhn404`) | Tủ đồ số, onboarding, affiliate | `wardrobe-service`, `fe/web-app/src/{pages,components,hooks,services}/user/wardrobe` |
| **Tuấn** (Member 2, `tennyhoang`) | Gợi ý outfit, Quick Pick, gói thuê bao, tính năng Pro, deploy | `outfit-service`, `billing-service`, `fe/web-app/src/{pages,components,hooks,services}/user/{outfit,billing}` |
| **Phát** (Member 3, `DoTruongPhat`) | Đăng nhập, phân quyền, Ask Friends, admin, quyền riêng tư | `auth-service`, `voting-service`, `fe/web-app/src/{pages,components,hooks,services}/{guest,user,admin}/{auth,voting,profile,dashboard}` |

---

## Thạch (Member 1) · Tủ đồ số

Cập nhật 06/11. Chủ phần: `be/services/wardrobe-service`, `fe/web-app/src/**/wardrobe/**`.
Cách làm: mỗi việc một nhánh `feature/<tên>`, **commit nhỏ theo từng bước** (migration → domain + test → API → giao diện),
mở PR, nhờ Tuấn review rồi merge. Phần logic mới phải có test. Đổi API thì sửa `wardrobe-api.yaml` + chạy `npm run gen:api` trong cùng PR.

| # | Việc | Code | Hạn | Xong khi |
|---|---|---|---|---|
| 1.1 | **Cloudinary (GẤP)**: ảnh tủ đồ trên Render đang lưu trên ổ đĩa nên **mất mỗi lần service khởi động lại**. Tạo tài khoản Cloudinary, điền `IMAGE_STORAGE=cloudinary` + 3 key cho `thelooks-wardrobe` trên Render, thêm 4 biến vào `render.yaml` | Cấu hình | 10/11 | Ảnh mới có link `res.cloudinary.com`, khởi động lại vẫn còn, xoá món thì ảnh bị xoá |
| 1.2 | **Xác nhận hàng loạt sau khi quét**: chọn nhiều món, sửa nhanh loại / màu ngay trong lưới, xác nhận một lần. API `POST /api/app/wardrobe/items/confirm` (danh sách món) | BE + FE + test | 15/11 | Quét 1 ảnh 3 món → xác nhận cả 3 trong 1 màn, không phải mở từng món |
| 1.3 | **Tìm và lọc tủ đồ**: API lọc theo loại, màu, mùa, phong cách, trạng thái + sắp xếp (mới nhất, lâu chưa mặc) + phân trang; thanh lọc trên trang Tủ đồ, giữ bộ lọc trên URL | BE + FE + test | 22/11 | Tủ đồ 50+ món vẫn tìm nhanh; test repository cho từng bộ lọc |
| 1.4 | **Giá mua, ngày mua, thương hiệu** cho món đồ: Flyway V3, domain, API, ô nhập ở màn sửa món | BE + FE + test | 22/11 | Lưu / sửa được, giá âm bị từ chối |
| 1.5 | **Onboarding phần tủ đồ**: sau trang chọn phong cách (`/onboarding`) dẫn từng bước thêm 3–5 món đầu, có thanh tiến độ, xong là hiện outfit đầu tiên | FE + test | 29/11 | Người dùng mới đi hết luồng đăng ký → có outfit đầu tiên không cần mò menu |
| 1.6 | **Thống kê tủ đồ (Pro)** (nhận từ việc 2.5 của Tuấn): số món theo loại / màu, tỉ lệ món được mặc, món lâu chưa mặc; trang `/wardrobe/stats` có biểu đồ; chỉ gói Pro (`WARDROBE_STATS` từ billing) | BE + FE + test | 06/12 | Người dùng Free thấy lời mời nâng cấp, Pro thấy số liệu đúng |
| 1.7 | **Chi phí mỗi lần mặc (Pro)** (nhận từ việc 2.4 của Tuấn): giá mua (1.4) ÷ số lần mặc (outfit-service đã có `WearLog`, thêm API đếm số lần mặc theo món); hiện trên chi tiết món và trang thống kê | BE (2 service) + FE + test | 13/12 | Món 300.000đ mặc 10 lần hiện 30.000đ/lần |
| 1.8 | **Xoá dữ liệu người dùng** (quyền riêng tư, phối hợp Phát việc 3.7): API xoá toàn bộ món, ảnh, lượt quét của một người | BE + test | 06/12 | Gọi xong không còn dữ liệu / ảnh của người đó |
| 1.9 | **Affiliate nguồn Shopee** (khi AccessTrade duyệt chiến dịch Shopee): nguồn `ProductCatalog` thứ hai, đồng bộ datafeed Shopee về bảng riêng mỗi ngày rồi tìm trong đó (datafeed không có tìm theo từ khoá) | BE + test | 20/12 | Gợi ý mua thêm có cả sản phẩm Shopee; làm theo mẫu `AccessTradeTikTokCatalog` |
| 1.10 | **Thử AI nhận diện** (Gemini) với 100–300 ảnh thật, chỉnh prompt nếu sai nhiều | Ít code | 22/11 | Bảng kết quả trong `docs/ai-nhan-dien.md` (tỉ lệ đúng loại / màu / khung cắt) cho báo cáo EXE |

Đã xong thay Thạch (không cần làm lại): chọn phong cách khi đăng ký (`/onboarding`, PR #19), Gợi ý mua thêm TikTok Shop (PR #18).

## Tuấn (Member 2) · Gợi ý outfit, gói thuê bao, deploy

| # | Việc | Hạn | Ghi chú |
|---|---|---|---|
| 2.1 | Merge các PR của mình theo thứ tự (#4 → #5 → #9, #6 → #8 → #10) | 08/11 | Cần 1 người review mỗi PR |
| 2.2 | **Đẩy file CI**, bật bảo vệ nhánh `main`, thêm `CODEOWNERS` | 08/11 | Xem `docs/viec-thu-cong.md` |
| 2.3 | Bỏ tủ đồ giả (`FakeWardrobeReader`) trong outfit-service, nối tủ đồ thật | 15/11 | Sau khi #10 merge |
| 2.4 | ~~Chi phí mỗi lần mặc~~ → chuyển cho Thạch (1.7) | | Tuấn review |
| 2.5 | ~~Thống kê tủ đồ~~ → chuyển cho Thạch (1.6) | | Tuấn review |
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
