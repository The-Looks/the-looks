# Phân công công việc

Cập nhật: 07/11/2026 · Giai đoạn MVP: T11–T12/2026 · Ra mắt giới hạn cho sinh viên FPT: T1/2027

Mỗi người sở hữu trọn phần của mình: backend, màn hình web và test. Ai cần đổi API của người khác thì sửa
`be/packages/contracts/.../*-api.yaml` trong PR và nhờ chủ phần đó review.

## Tóm tắt

| Người | Phụ trách chính | Service / thư mục |
|---|---|---|
| **Thạch** (Member 1, `thachhn404`) | Tủ đồ số, onboarding, affiliate | `wardrobe-service`, `fe/web-app/src/{pages,components,hooks,services}/user/wardrobe` |
| **Tuấn** (Member 2, `tennyhoang`) | Gợi ý outfit, Quick Pick, gói thuê bao, tính năng Pro, deploy | `outfit-service`, `billing-service`, `fe/web-app/src/{pages,components,hooks,services}/user/{outfit,billing}` |
| **Phát** (Member 3, `DoTruongPhat`) | Đăng nhập, phân quyền, Ask Friends, admin, quyền riêng tư | `auth-service`, `voting-service`, `fe/web-app/src/{pages,components,hooks,services}/{guest,user,admin}/{auth,voting,profile,dashboard}` |

## Tình trạng ngày 07/11

- `main` xanh: backend `mvnw verify` (5 service + ArchUnit) và web (typecheck, lint, 52 test, build) đều qua.
- Đã xong: deploy Vercel + Render + Neon, PayOS + tự gia hạn, gói 49k/79k, affiliate TikTok Shop, sở thích phong cách,
  admin (thống kê, đơn, hoàn tiền, chặn sản phẩm, trạng thái hệ thống), trang pháp lý + đồng ý khi đăng ký,
  Thạch 1.2–1.7 (PR #38), dán ảnh khi thêm món (PR #41), tủ đồ thật cho outfit (tủ đồ giả chỉ còn ở profile `demo`).
- **Sau mỗi lần merge backend phải đợi Render build xong (10–15 phút/service)**. Trong lúc đó web mới gọi API cũ sẽ lỗi
  (ví dụ `/items/search` trả 400 "Failed to convert 'itemId'"). Kiểm tra tab *Events* của service trên Render.

---

## Thạch (Member 1) · Tủ đồ số

Cách làm: mỗi việc một nhánh `feature/<tên>`, commit nhỏ theo từng bước (migration → domain + test → API → giao diện),
mở PR, nhờ Tuấn review. Đổi API thì sửa `wardrobe-api.yaml` + chạy `npm run gen:api` trong cùng PR.

| # | Việc | Code | Hạn | Xong khi |
|---|---|---|---|---|
| 1.11 | **Cất đi / đã bán + sửa, xoá nhiều món cùng lúc**: hiện `ItemStatus` chỉ có `PROCESSING, PENDING_REVIEW, CONFIRMED, RECOGNITION_FAILED`. Thêm trạng thái `ARCHIVED` (cất đi) và `SOLD` (đã bán), món cất đi / đã bán không vào gợi ý outfit. API `PATCH /items/batch` (đổi trạng thái) và `DELETE /items/batch`; lưới tủ đồ có chế độ chọn nhiều món | BE + FE + test | 22/11 | Chọn 10 món, cất đi trong 1 thao tác; outfit không gợi ý món đã cất |
| 1.12 | **Gợi ý dọn tủ (Pro)**: danh sách món ≥ 90 ngày chưa mặc (dùng `wear-summary` có sẵn), nút "Cất đi" / "Đã bán" (dùng 1.11); hiện trên trang thống kê | BE + FE + test | 06/12 | Pro thấy danh sách đúng, Free thấy lời mời nâng cấp. Làm sau 1.11 |
| 1.8 | **Xoá ảnh khi xoá tài khoản**: PR #40 chỉ xoá DB tủ đồ, file ảnh vẫn còn. Sau khi #40 merge: lấy danh sách key ảnh của người dùng rồi gọi `ImageStorage.delete` (đã có cho cả local và Cloudinary) trong `ManageWardrobeUserDataService` | BE + test | 15/11 sau khi #40 merge | Xoá tài khoản xong không còn ảnh nào của người đó trên Cloudinary |
| 1.10 | **Thử AI nhận diện** (Gemini) với 100–300 ảnh thật, chỉnh prompt nếu sai nhiều | Ít code | 29/11 | Bảng kết quả trong `docs/ai-nhan-dien.md` cho báo cáo EXE |
| 1.9 | **Affiliate nguồn Shopee**: chỉ làm khi AccessTrade **đã duyệt** chiến dịch Shopee (đang chờ). Nguồn `ProductCatalog` thứ hai theo mẫu `AccessTradeTikTokCatalog` | BE + test | Khi được duyệt | Gợi ý mua thêm có cả sản phẩm Shopee |

Đã bỏ khỏi danh sách: ~~1.1 Cloudinary~~ (code do Tuấn viết từ 01/11, chỉ còn điền key trên Render → chuyển cho Tuấn, việc 2.0).

## Tuấn (Member 2) · Gợi ý outfit, gói thuê bao, deploy

| # | Việc | Hạn | Ghi chú |
|---|---|---|---|
| 2.0 | **Điền key Cloudinary** cho `thelooks-wardrobe` trên Render (`IMAGE_STORAGE` + 3 biến `CLOUDINARY_*`), thử thêm món → link `res.cloudinary.com` | 08/11 | Code và `render.yaml` đã xong (PR #43) |
| 2.8 | Điền key **PayOS**, Gemini, AccessTrade trên Render; theo dõi chi phí AI hằng tuần | 10/11 | Ngân sách AI 25 USD/tháng |
| 2.2 | **Đẩy file CI** (`.github/workflows/ci.yml` đang nằm ngoài git), bật bảo vệ nhánh `main`; thêm bước `npm run typecheck` cho web-app | 10/11 | Token `gh` thiếu quyền `workflow`: chạy `gh auth refresh -s workflow` |
| 2.11 | Review PR #40 phần billing + outfit | 10/11 | |
| 2.10 | Ghi nhận **đồng ý điều khoản khi đăng ký bằng Google** (hiện chỉ đăng ký email mới ghi `user_consents`) | 22/11 | |
| 2.12 | **Thời tiết theo thành phố người dùng**: outfit đang cố định TP.HCM (`WEATHER_LAT/LON`); khi 3.8 có thành phố thì lấy theo hồ sơ | 20/12 | Sau 3.8 |
| 2.9 | **Email nhắc gia hạn** (3 ngày trước khi hết hạn) qua Resend | 13/12 | Hiện chỉ nhắc trong app |
| 2.6 | **Lịch mặc** (Pro): lên lịch outfit theo ngày, đánh dấu đã mặc | 20/12 | Chưa có code |

## Phát (Member 3) · Đăng nhập, Ask Friends, admin

| # | Việc | Hạn | Ghi chú |
|---|---|---|---|
| 3.9 | **Sửa PR #40 để merge được** (xem mục dưới) | 10/11 | Chặn 1.8 của Thạch |
| 3.3 | Thêm **test cho auth-service** (hiện chỉ có 3 file test): đăng ký trùng, sai mật khẩu, refresh token bị dùng lại, JWT hết hạn, xoá tài khoản lỗi giữa chừng rồi thử lại | 15/11 | |
| 3.8 | **Hồ sơ cá nhân**: đổi tên hiển thị, ảnh đại diện (hiện chỉ là chữ cái đầu), thành phố | 06/12 | Báo Tuấn khi có thành phố (2.12) |
| 3.10 | **Tự xoá tài khoản** ở trang Hồ sơ | 13/12 | Luồng xoá của #40 gửi token của người gọi sang các service, mà API xoá dữ liệu cần quyền `PERMISSION_USER_DELETE` (chỉ admin có). Người dùng thường tự xoá sẽ bị 403 → cần cách gọi nội bộ giữa các service (khoá bí mật dùng chung hoặc token riêng của service) |

**PR #40 cần sửa trước khi merge:**

1. **Trùng số migration Flyway** với `main` (git không báo, nhưng service sẽ không khởi động được trên Neon):
   - billing `V3__anonymize_deleted_account_orders` / `V4__deleted_owner_guard` → đổi thành **V4 / V5** (`main` đã có `V3__order_refund`)
   - outfit `V6__deleted_owner_guard` → **V7** (`main` đã có `V6__create_affiliate_block`)
   - wardrobe `V3__account_deletion_guard` → **V4** (`main` đã có `V3__item_purchase_details`). Việc 1.11 của Thạch cũng cần migration wardrobe: PR nào merge sau thì lấy số tiếp theo
2. **7 file xung đột**: `billing-api.yaml`, `wardrobe-api.yaml`, `AdminBillingController.java`, `billing.d.ts`, `wardrobe.d.ts`,
   `AdminDashboardPage.tsx`, `vercel.json`. Merge `main` vào nhánh, giữ cả hai phần, rồi chạy `npm run gen:api`.
3. Chạy lại `./mvnw verify` và `npm run typecheck && npm test && npm run build` trước khi báo review.

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
