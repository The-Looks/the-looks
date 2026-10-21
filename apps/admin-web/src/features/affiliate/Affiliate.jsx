import { Badge, Card, PageHead, StatCard } from '../../shared/ui/Ui.jsx';
import { reconciliation } from '../../shared/mock.js';
import { useStore } from '../../shared/store.jsx';

export default function Affiliate() {
  const { showToast } = useStore();

  return (
    <>
      <PageHead
        crumb="Quản trị / Affiliate"
        title="Doanh thu affiliate"
        subtitle="Theo dõi hoa hồng từ liên kết mua sắm Shopee và TikTok Shop."
        actions={
          <button type="button" className="btn sm" onClick={() => showToast('Đang chuẩn bị báo cáo (dữ liệu mẫu)')}>
            Xuất báo cáo
          </button>
        }
      />
      <div className="grid c3">
        <StatCard icon="wallet" value="8.420.000đ" label="Hoa hồng phát sinh" note="Tháng 10/2026" />
        <StatCard icon="check" value="6.180.000đ" label="Đã đối soát" note="Có thể ghi nhận" noteTone="green" />
        <StatCard icon="clock" value="2.240.000đ" label="Chờ đối soát" note="Từ đơn mới" noteTone="amber" />
      </div>

      <div className="grid c2 mt">
        <Card title="Hiệu quả liên kết">
          <div className="grid c3">
            {[
              ['12.860', 'Lượt nhấp'],
              ['412', 'Đơn hợp lệ'],
              ['3,2%', 'Tỷ lệ chuyển đổi'],
            ].map(([v, l]) => (
              <div key={l} style={{ background: 'var(--lavender-soft)', borderRadius: 12, padding: 14 }}>
                <div className="stat-value t-purple" style={{ fontSize: 24 }}>{v}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Nguồn hoa hồng" subtitle="Chỉ số tổng hợp; doanh số đối tác tách khỏi hoa hồng LOOKSY.">
          <div className="source-card"><span>Shopee</span><b>5.220.000đ</b></div>
          <div className="source-card"><span>TikTok Shop</span><b>3.200.000đ</b></div>
        </Card>
      </div>

      <Card
        className="mt"
        title="Đối soát theo nguồn"
        action={<button type="button" className="link" onClick={() => showToast('Xem đối soát sẽ có khi nối API')}>Xem đối soát</button>}
      >
        <table>
          <thead>
            <tr>
              <th>Nguồn</th>
              <th>Kỳ đối soát</th>
              <th>Đơn hợp lệ</th>
              <th>Hoa hồng</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {reconciliation.map((r) => (
              <tr key={r.source + r.period}>
                <td className="strong">{r.source}</td>
                <td>{r.period}</td>
                <td>{r.orders}</td>
                <td>{r.commission}</td>
                <td><Badge>{r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="footnote">Hoa hồng chỉ được ghi nhận sau khi đơn hàng hợp lệ và đối tác xác nhận.</p>
      </Card>
    </>
  );
}
