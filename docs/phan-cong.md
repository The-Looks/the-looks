# Phân công công việc

Cập nhật: 08/11/2026 · Giai đoạn MVP: T11–T12/2026 · Ra mắt giới hạn cho sinh viên FPT: T1/2027

Mỗi người sở hữu trọn phần của mình: backend, màn hình web và test. Ai cần đổi API của người khác thì sửa
`be/packages/contracts/.../*-api.yaml` trong PR và nhờ chủ phần đó review.

## Tóm tắt

| Người | Phụ trách chính | Service / thư mục |
|---|---|---|
| **Thạch** (Member 1, `thachhn404`) | Giao diện chung, hình ảnh + linh vật, chào đón người mới (từ 08/11) | `fe/web-app/src/components/shared`, `fe/web-app/public/illustrations`, trang chủ + onboarding |
| **Tuấn** (Member 2, `tennyhoang`) | Gợi ý outfit, Quick Pick, gói thuê bao, tính năng Pro, deploy; nhận lại tủ đồ số + affiliate từ 08/11 | `outfit-service`, `billing-service`, `wardrobe-service`, `fe/web-app/src/{pages,components,hooks,services}/user/{outfit,billing,wardrobe}` |
| **Phát** (Member 3, `DoTruongPhat`) | Đăng nhập, phân quyền, Ask Friends, admin, quyền riêng tư | `auth-service`, `voting-service`, `fe/web-app/src/{pages,components,hooks,services}/{guest,user,admin}/{auth,voting,profile,dashboard}` |

## Tình trạng ngày 07/11

- `main` xanh: backend `mvnw verify` (5 service + ArchUnit) và web (typecheck, lint, 52 test, build) đều qua.
- Đã xong: deploy Vercel + Render + Neon, PayOS + tự gia hạn, gói 49k/79k, affiliate TikTok Shop, sở thích phong cách,
  admin (thống kê, đơn, hoàn tiền, chặn sản phẩm, trạng thái hệ thống), trang pháp lý + đồng ý khi đăng ký,
  Thạch 1.2–1.7 (PR #38), dán ảnh khi thêm món (PR #41), tủ đồ thật cho outfit (tủ đồ giả chỉ còn ở profile `demo`).
- **Sau mỗi lần merge backend phải đợi Render build xong (10–15 phút/service)**. Trong lúc đó web mới gọi API cũ sẽ lỗi
  (ví dụ `/items/search` trả 400 "Failed to convert 'itemId'"). Kiểm tra tab *Events* của service trên Render.

---

## Thạch (Member 1) · Giao diện, hình ảnh, chào đón người mới

Từ 08/11 Thạch nhận việc mới trong mục *Feedback người dùng 08/11* (1.13–1.15); việc tủ đồ cũ (1.8–1.12) chuyển cho Tuấn.
Cách làm: mỗi việc một nhánh `feature/<tên>`, commit nhỏ, mở PR, nhờ Tuấn review.

## Tuấn (Member 2) · Gợi ý outfit, gói thuê bao, deploy

| # | Việc | Hạn | Ghi chú |
|---|---|---|---|
| 2.0 | ~~Key Cloudinary trên Render~~ (xong 07/11) | | |
| 2.8 | ~~Key PayOS, Gemini, AccessTrade trên Render~~ (xong 07/11); theo dõi chi phí AI hằng tuần | Liên tục | Ngân sách AI 25 USD/tháng |
| 2.2 | ~~CI + bảo vệ nhánh `main`~~ (xong 07/11): mọi PR phải qua 2 job `backend` và `web` mới merge được | | |
| 2.11 | Kiểm tra luồng xoá tài khoản của #40 trên bản deploy (admin xoá 1 tài khoản thử) | 10/11 | |
| 2.10 | ~~Đồng ý điều khoản khi đăng ký bằng Google~~ (xong 07/11) | | |
| 2.12 | ~~Thời tiết theo thành phố~~ (xong 07/11: Phát nối hồ sơ ở PR #52, Tuấn thêm dự phòng thành phố mặc định) | | |
| 2.9 | ~~Email nhắc gia hạn~~ (code xong 07/11, Brevo): còn tạo tài khoản Brevo + điền `BREVO_API_KEY`, `MAIL_FROM` | | `docs/viec-thu-cong.md` |
| 2.6 | ~~Lịch mặc (Pro)~~ (xong 07/11): `/outfits/calendar` | | |

**Nhận lại từ Thạch (08/11)** — tủ đồ số; đổi API thì sửa `wardrobe-api.yaml` + `npm run gen:api` trong cùng PR:

| # | Việc | Code | Hạn | Xong khi |
|---|---|---|---|---|
| 1.11 | ~~Cất đi / đã bán + đổi trạng thái, xoá nhiều món cùng lúc~~ (xong 08/11): nút *Chọn nhiều* ở tủ đồ, `PATCH /items/batch`, `POST /items/batch-delete` | | | |
| 1.12 | **Gợi ý dọn tủ (Pro)**: danh sách món ≥ 90 ngày chưa mặc (dùng `wear-summary` có sẵn), nút "Cất đi" / "Đã bán" (dùng 1.11); hiện trên trang thống kê | BE + FE + test | 06/12 | Pro thấy danh sách đúng, Free thấy lời mời nâng cấp. Làm sau 1.11 |
| 1.8 | ~~Xoá ảnh khi xoá tài khoản~~ (đã có từ PR #44 của Phát) | | | |
| 1.10 | **Thử AI nhận diện** (Gemini) với 100–300 ảnh thật, chỉnh prompt nếu sai nhiều | Ít code | 29/11 | Bảng kết quả trong `docs/ai-nhan-dien.md` cho báo cáo EXE |
| 1.9 | **Affiliate nguồn Shopee**: chỉ làm khi AccessTrade **đã duyệt** chiến dịch Shopee (đang chờ). Nguồn `ProductCatalog` thứ hai theo mẫu `AccessTradeTikTokCatalog` | BE + test | Khi được duyệt | Gợi ý mua thêm có cả sản phẩm Shopee |

## Phát (Member 3) · Đăng nhập, Ask Friends, admin

| # | Việc | Hạn | Ghi chú |
|---|---|---|---|
| 3.3 | ~~Test auth-service~~ (xong 07/11, PR #52) | | |
| 3.8 | ~~Hồ sơ: tên, ảnh, thành phố~~ (xong 07/11, PR #52) | | |
| 3.10 | ~~Tự xoá tài khoản~~ (xong 07/11, PR #52) | | |

**PR #40 / #44 (đã merge 07/11):** Phát đã gỡ xung đột; migration trùng số đã được Tuấn sửa gấp ngay sau đó
(billing V4/V5, outfit V7, wardrobe V4). Lần sau tạo migration mới: kiểm tra số lớn nhất trên `main` ngay trước khi merge.

## Feedback người dùng 08/11

Người dùng thử góp ý: hồ sơ cá nhân, khảo sát phong cách, giao diện sinh động hơn, chào đón người mới,
chào người dùng cũ, lưu việc dang dở, chữ dễ đọc hơn. Việc giao diện + chào đón giao cho Thạch, khảo sát (đụng chấm điểm gợi ý) giữ cho Tuấn.

Thứ tự bắt buộc: **1.13 làm trước** (đổi CSS chung, tránh xung đột), **1.14 trước 3.11** (cần bộ linh vật),
**2.15 trước 1.15**, **3.12 trước 3.13**.

| # | Người | Việc | Code | Hạn | Xong khi |
|---|---|---|---|---|---|
| 1.13 | Thạch | **Chữ & UI**: cỡ chữ gốc 16→17px, thang tiêu đề rõ hơn, chữ phụ đủ tương phản (WCAG AA ≥ 4.5:1), một màu highlight thống nhất. Chỉ sửa token trong `components/shared/theme/web-app.css` | FE | 13/11 | Mọi trang đọc rõ trên điện thoại, tương phản đạt AA |
| 1.14 | Thạch | **Phong cách hình ảnh + linh vật**: chốt bộ màu/nét vẽ, dùng AI tạo 6 linh vật + 3–4 illustration (banner trang chủ, trang trống, chào đón) vào `fe/web-app/public/illustrations/`; làm lại banner trang chủ | FE + ảnh | 15/11 | Banner mới lên web; 6 linh vật sẵn cho Phát dùng |
| 2.15 | Tuấn | **Khảo sát phong cách**: mở rộng `StylePreferences` (dịp hay mặc: đi học/đi làm/đi chơi/hẹn hò; màu yêu thích; dáng ôm/rộng) + 5 câu trắc nghiệm tính cách quy ra nhãn phong cách. Migration outfit, dùng trong chấm điểm gợi ý | BE + FE + test | 25/11 | Hai người trả lời khác nhau nhận gợi ý khác nhau (có test) |
| 1.15 | Thạch | **Chào đón người mới**: lần đầu đăng nhập (chưa có sở thích, tủ trống) → 4 bước: chào + chọn linh vật → khảo sát 2.15 → thêm 3 món đầu (dùng lại onboarding tủ đồ) → outfit đầu tiên. Bỏ qua được, có thanh tiến trình | FE + test | 02/12 | Tài khoản mới đi hết 4 bước dưới 3 phút |
| 3.11 | Phát | **Hồ sơ: tên hiển thị + linh vật**: `user_profiles` thêm `display_name` (mặc định tên Google) và `mascot` (1 trong 6 mã của 1.14); `/api/app/me` trả 2 trường; header + trang Hồ sơ hiện tên, avatar, linh vật | BE + FE + test | 20/11 | Đổi tên, chọn linh vật → header đổi ngay |
| 3.12 | Phát | **Lưu việc dang dở**: lưu trên trình duyệt (localStorage) trang đang làm + nháp (thêm món, tạo bình chọn, gợi ý outfit đang xem); quay lại thì khôi phục | FE + test | 27/11 | Đang tạo bình chọn, đóng tab, mở lại vẫn còn nháp |
| 3.13 | Phát | **Chào người dùng cũ**: trang chủ "Chào {tên}" + linh vật, thẻ "Tiếp tục" ghép từ 3.12 và dữ liệu có sẵn (món chờ duyệt, bình chọn sắp hết hạn, lịch mặc hôm nay) | FE + test | 04/12 | Người cũ vào trang chủ thấy tên mình và 1–3 việc để làm tiếp |

Cố ý chưa làm: lưu nháp trên server / đồng bộ nhiều máy (localStorage đủ cho MVP), bảng lịch sử hoạt động riêng
(3.13 ghép từ dữ liệu đã có).

## Cả nhóm

| # | Việc | Hạn |
|---|---|---|
| 4.1 | Review PR của nhau: mỗi PR ít nhất 1 người duyệt trong 48 giờ | Liên tục |
| 4.4 | Email liên hệ chung của nhóm cho trang pháp lý (`LEGAL_CONTACT_EMAIL`) | 15/11 |
| 4.5 | Cho **≥ 20 người dùng thử**, sửa ≥ 3 vấn đề | 20/12 |
| 4.6 | Sửa **tài liệu nộp** theo hướng "web trước, mobile sau" | 15/11 |

## Để sau MVP

- **Phí giao dịch** trên đơn mua qua đối tác: cần có đối tác bán trực tiếp trước.
- **Trừ tiền tự động thật** khi gia hạn: cần pháp nhân / hộ kinh doanh.
- **Thử đồ 3D**, **app mobile** (React Native), **bình luận** trong bình chọn.

## Quy tắc chung

- Mỗi việc là một nhánh `feature/<tên>` → Pull Request → 1 người review → merge. Không push thẳng `main`.
- Xong việc = có test + CI xanh + chạy được trên web. Đổi API thì sửa file contract trong cùng PR.
- Thêm migration: lấy số **lớn nhất trên `main` lúc merge** + 1, kiểm tra lại ngay trước khi merge.
- Bị chặn quá 1 ngày vì chờ người khác: báo ngay trong nhóm Zalo.
- Đổi người phụ trách hoặc đổi hạn: sửa file này trong PR.
