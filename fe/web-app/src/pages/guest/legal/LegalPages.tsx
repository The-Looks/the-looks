import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader } from '../../../components/shared/layout/PublicHeader';
import { SiteFooter } from '../../../components/shared/layout/SiteFooter';
import { LEGAL_CONTACT_EMAIL, LEGAL_OPERATOR, LEGAL_UPDATED } from '../../../services/shared/legal';

// Bản nháp dựa trên cách app đang hoạt động; nhóm cần nhờ người có chuyên môn pháp lý rà lại trước khi ra mắt.

function Contact() {
  return LEGAL_CONTACT_EMAIL
    ? <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
    : <span>email liên hệ (đang cập nhật)</span>;
}

function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="public-home">
      <PublicHeader page="home" />
      <main className="stack-lg" style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 48px' }}>
        <Link className="back" to="/">‹ Về trang chủ</Link>
        <article className="stack">
          <h1>{title}</h1>
          <p className="small muted">Cập nhật lần cuối: {LEGAL_UPDATED} · Đơn vị vận hành: {LEGAL_OPERATOR}</p>
          {children}
          <p className="small muted">
            Xem thêm: <Link to="/terms">Điều khoản sử dụng</Link> · <Link to="/privacy">Chính sách quyền riêng tư</Link> ·{' '}
            <Link to="/refund">Thanh toán và hoàn tiền</Link>
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title="Điều khoản sử dụng">
      <p>Khi tạo tài khoản hoặc sử dụng THE LOOKS, bạn đồng ý với các điều khoản dưới đây và với <Link to="/privacy">Chính sách quyền riêng tư</Link>.</p>

      <h2>1. Dịch vụ</h2>
      <p>THE LOOKS là ứng dụng web giúp bạn lưu tủ đồ bằng ảnh, nhận gợi ý phối đồ theo dịp và thời tiết, hỏi ý kiến bạn bè qua link bình chọn và tham khảo sản phẩm thời trang phù hợp với tủ đồ.</p>

      <h2>2. Tài khoản</h2>
      <ul>
        <li>Bạn cần đủ 16 tuổi, hoặc có sự đồng ý của cha mẹ / người giám hộ, để tạo tài khoản.</li>
        <li>Bạn chịu trách nhiệm giữ bí mật mật khẩu và mọi hoạt động trong tài khoản của mình.</li>
        <li>Chúng tôi có thể tạm khoá tài khoản vi phạm điều khoản này hoặc pháp luật.</li>
      </ul>

      <h2>3. Nội dung của bạn</h2>
      <ul>
        <li>Ảnh và thông tin món đồ bạn tải lên vẫn thuộc về bạn. Bạn cho phép THE LOOKS lưu trữ và xử lý chúng (kể cả bằng dịch vụ AI) chỉ để cung cấp tính năng cho bạn.</li>
        <li>Chỉ tải lên ảnh bạn có quyền sử dụng. Không tải nội dung vi phạm pháp luật, khiêu dâm, bạo lực hoặc ảnh người khác khi chưa được đồng ý.</li>
        <li>Link bình chọn bạn chia sẻ cho phép bất kỳ ai có link xem các outfit trong bình chọn đó.</li>
      </ul>

      <h2>4. Gợi ý của AI</h2>
      <p>Gợi ý phối đồ và nhận diện quần áo do AI tạo ra chỉ mang tính tham khảo và có thể chưa chính xác. Bạn nên kiểm tra lại thông tin món đồ trước khi xác nhận.</p>

      <h2>5. Liên kết tiếp thị (affiliate)</h2>
      <p>Mục "Gợi ý mua thêm" có liên kết tới sản phẩm trên sàn thương mại điện tử (ví dụ TikTok Shop) thông qua mạng tiếp thị AccessTrade. THE LOOKS có thể nhận hoa hồng khi bạn mua qua các liên kết này; giá bạn trả không thay đổi. Việc mua bán, giao hàng, đổi trả do sàn và người bán chịu trách nhiệm.</p>

      <h2>6. Gói trả phí</h2>
      <p>Gói Plus và Pro được thanh toán trước theo tháng hoặc năm. Chi tiết về thanh toán, tự gia hạn và hoàn tiền nằm ở trang <Link to="/refund">Thanh toán và hoàn tiền</Link>.</p>

      <h2>7. Giới hạn trách nhiệm</h2>
      <p>Dịch vụ được cung cấp theo hiện trạng. Chúng tôi cố gắng để dịch vụ hoạt động ổn định nhưng không cam kết không bao giờ gián đoạn, và không chịu trách nhiệm cho thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ, trong phạm vi pháp luật cho phép.</p>

      <h2>8. Thay đổi điều khoản</h2>
      <p>Khi điều khoản thay đổi đáng kể, chúng tôi sẽ thông báo trong ứng dụng và có thể đề nghị bạn đồng ý lại. Điều khoản được điều chỉnh theo pháp luật Việt Nam.</p>

      <h2>9. Liên hệ</h2>
      <p>Mọi câu hỏi về điều khoản, vui lòng liên hệ: <Contact />.</p>
    </LegalLayout>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout title="Chính sách quyền riêng tư">
      <p>Chính sách này giải thích THE LOOKS thu thập dữ liệu cá nhân nào, dùng vào việc gì, chia sẻ với ai và quyền của bạn, theo quy định của pháp luật Việt Nam về bảo vệ dữ liệu cá nhân.</p>

      <h2>1. Dữ liệu chúng tôi thu thập</h2>
      <ul>
        <li><strong>Tài khoản:</strong> email, tên người dùng, mật khẩu (chỉ lưu dạng đã mã hoá một chiều). Nếu đăng nhập bằng Google: email và mã định danh tài khoản Google.</li>
        <li><strong>Ảnh tủ đồ:</strong> ảnh bạn chụp hoặc tải lên. Ảnh gốc chỉ dùng để nhận diện rồi bị bỏ đi; chúng tôi chỉ lưu ảnh đã cắt của từng món đồ. Ảnh gốc có thể chứa khuôn mặt hoặc cơ thể của bạn.</li>
        <li><strong>Thông tin món đồ:</strong> loại, màu, chất liệu, mùa, phong cách.</li>
        <li><strong>Hồ sơ phong cách (không bắt buộc):</strong> giới tính, phong cách yêu thích, ngân sách mua sắm.</li>
        <li><strong>Hoạt động trong app:</strong> outfit đã lưu, lượt thích / không thích gợi ý, lần mặc, bình chọn, lượt bấm "Gợi ý mua thêm", thời điểm đăng nhập.</li>
        <li><strong>Thanh toán:</strong> gói đã mua, mã đơn, số tiền, thời điểm thanh toán. Chúng tôi không nhận và không lưu số thẻ hay thông tin tài khoản ngân hàng của bạn.</li>
        <li><strong>Bình chọn công khai:</strong> để chống bình chọn trùng, chúng tôi lưu một mã băm (không đảo ngược được) tạo từ địa chỉ IP của người bình chọn, không lưu IP gốc.</li>
        <li><strong>Kỹ thuật:</strong> cookie đăng nhập (bắt buộc để giữ phiên), nhật ký lỗi của máy chủ.</li>
      </ul>

      <h2>2. Mục đích sử dụng</h2>
      <ul>
        <li>Cung cấp tính năng: lưu tủ đồ, nhận diện món đồ, gợi ý outfit theo dịp, thời tiết và gu của bạn, bình chọn, gói trả phí.</li>
        <li>Cá nhân hoá: học gu của bạn từ lượt thích, outfit đã lưu và đồ hay mặc; chọn sản phẩm gợi ý theo giới tính và ngân sách bạn chọn.</li>
        <li>Thống kê tổng hợp (số người dùng mới, người dùng hoạt động, doanh thu) để vận hành và cải thiện dịch vụ.</li>
        <li>Bảo mật, chống gian lận và tuân thủ pháp luật.</li>
      </ul>
      <p>Chúng tôi không bán dữ liệu cá nhân của bạn.</p>

      <h2>3. Bên thứ ba xử lý dữ liệu</h2>
      <ul>
        <li><strong>Dịch vụ AI (Google Gemini, Anthropic Claude):</strong> nhận ảnh món đồ và mô tả tủ đồ để nhận diện quần áo và gợi ý outfit. Với một số gói dịch vụ miễn phí, nhà cung cấp AI có thể dùng dữ liệu gửi lên để cải thiện sản phẩm của họ.</li>
        <li><strong>PayOS:</strong> xử lý thanh toán gói qua VietQR / chuyển khoản.</li>
        <li><strong>AccessTrade, TikTok Shop:</strong> khi bạn bấm "Gợi ý mua thêm", liên kết kèm một mã ẩn danh (không chứa email hay tên) để ghi nhận hoa hồng.</li>
        <li><strong>Hạ tầng:</strong> Vercel (web), Render (máy chủ ứng dụng), Neon (cơ sở dữ liệu), Cloudinary (lưu ảnh, nếu được bật), Open-Meteo (thời tiết, không nhận dữ liệu cá nhân).</li>
      </ul>

      <h2>4. Lưu trữ ngoài Việt Nam</h2>
      <p>Máy chủ và cơ sở dữ liệu của chúng tôi đặt tại Singapore; một số nhà cung cấp ở trên có thể xử lý dữ liệu tại các quốc gia khác. Khi tạo tài khoản, bạn đồng ý với việc chuyển dữ liệu ra nước ngoài cho các mục đích nêu trong chính sách này.</p>

      <h2>5. Thời gian lưu trữ</h2>
      <p>Dữ liệu được lưu khi tài khoản còn hoạt động. Món đồ bạn xoá sẽ bị xoá cùng ảnh. Khi bạn yêu cầu xoá tài khoản, dữ liệu cá nhân sẽ bị xoá; riêng thông tin đơn thanh toán có thể được giữ lại trong thời hạn pháp luật về kế toán, thuế yêu cầu.</p>

      <h2>6. Quyền của bạn</h2>
      <ul>
        <li>Xem, sửa thông tin và hồ sơ phong cách trong mục Cá nhân; xoá từng món đồ trong Tủ đồ.</li>
        <li>Yêu cầu cung cấp bản sao, chỉnh sửa, xoá dữ liệu hoặc xoá tài khoản; rút lại sự đồng ý (khi đó chúng tôi có thể không cung cấp được một số tính năng).</li>
        <li>Gửi yêu cầu tới <Contact />. Chúng tôi phản hồi trong thời hạn pháp luật quy định.</li>
      </ul>

      <h2>7. Trẻ em</h2>
      <p>Người dưới 16 tuổi chỉ nên sử dụng THE LOOKS khi có sự đồng ý của cha mẹ hoặc người giám hộ.</p>

      <h2>8. Bảo mật</h2>
      <p>Kết nối được mã hoá (HTTPS), mật khẩu được băm bằng thuật toán chuyên dụng, cookie đăng nhập không đọc được bằng JavaScript và chỉ nhận yêu cầu từ trang web chính thức. Không hệ thống nào an toàn tuyệt đối; nếu xảy ra sự cố lộ dữ liệu, chúng tôi sẽ thông báo theo quy định.</p>

      <h2>9. Liên hệ</h2>
      <p>Câu hỏi về dữ liệu cá nhân: <Contact />.</p>
    </LegalLayout>
  );
}

export function RefundPage() {
  return (
    <LegalLayout title="Thanh toán, gia hạn và hoàn tiền">
      <h2>1. Giá và thanh toán</h2>
      <ul>
        <li>Gói Free: miễn phí. Gói Plus: 49.000đ/tháng hoặc 499.000đ/năm. Gói Pro: 79.000đ/tháng hoặc 799.000đ/năm. Giá đã gồm thuế (nếu có).</li>
        <li>Thanh toán qua PayOS bằng mã VietQR hoặc chuyển khoản ngân hàng. Gói được kích hoạt ngay khi hệ thống nhận được tiền.</li>
        <li>Đổi gói khi gói cũ còn hạn: thời gian còn lại được quy đổi theo giá trị sang gói mới, bạn không mất tiền.</li>
      </ul>

      <h2>2. Tự gia hạn</h2>
      <ul>
        <li>THE LOOKS <strong>không tự động trừ tiền</strong> của bạn. "Tự gia hạn" nghĩa là chúng tôi nhắc bạn trước ngày hết hạn 3 ngày và giữ quyền lợi gói thêm 3 ngày sau ngày hết hạn để bạn thanh toán.</li>
        <li>Bạn có thể tắt tự gia hạn bất cứ lúc nào trong thẻ "Gói hiện tại". Khi tắt, gói vẫn dùng đến hết ngày hết hạn rồi chuyển về Free; dữ liệu của bạn được giữ nguyên.</li>
      </ul>

      <h2>3. Hoàn tiền</h2>
      <ul>
        <li><strong>Hoàn 100%</strong> khi: bạn bị trừ tiền nhưng gói không được kích hoạt, chuyển khoản trùng, hoặc chuyển sai số tiền / sai nội dung khiến hệ thống không ghi nhận.</li>
        <li><strong>Trong 7 ngày</strong> kể từ lần thanh toán đầu tiên của một gói, nếu dịch vụ không hoạt động như mô tả, bạn có thể yêu cầu hoàn tiền.</li>
        <li>Ngoài các trường hợp trên, gói đã thanh toán không được hoàn lại cho thời gian chưa sử dụng.</li>
        <li>Gửi yêu cầu tới <Contact /> kèm mã đơn (hiển thị ở trang kết quả thanh toán) và ảnh giao dịch. Tiền được hoàn về tài khoản đã chuyển trong vòng 7 ngày làm việc kể từ khi yêu cầu được xác nhận.</li>
      </ul>

      <h2>4. Mua hàng qua "Gợi ý mua thêm"</h2>
      <p>Sản phẩm mua qua liên kết tiếp thị được bán bởi sàn thương mại điện tử và người bán trên sàn. Đổi trả, hoàn tiền các đơn này theo chính sách của sàn đó, không do THE LOOKS xử lý.</p>
    </LegalLayout>
  );
}
