import { Badge, BarChart, Card, PageHead, StatCard } from '../../shared/ui/Ui.jsx';
import { revenueTrend, transactions } from '../../shared/mock.js';
import { useStore } from '../../shared/store.jsx';

export default function Plans() {
  const { showToast } = useStore();

  return (
    <>
      <PageHead
        crumb="Quản trị / Doanh thu gói"
        title="Doanh thu gói"
        subtitle="Theo dõi gói dịch vụ, giao dịch và tình trạng thanh toán."
        actions={
          <button type="button" className="btn sm" onClick={() => showToast('Đang chuẩn bị báo cáo (dữ liệu mẫu)')}>
            Xuất báo cáo
          </button>
        }
      />
      <div className="grid c3">
        <StatCard icon="wallet" value="28.650.000đ" label="Doanh thu tháng" note="Tổng đã thanh toán" />
        <StatCard icon="users" value="386" label="Gói đang hoạt động" note="Plus và Premium" noteTone="green" />
        <StatCard icon="alert" value="7" label="Giao dịch cần xử lý" note="Hoàn tiền / thất bại" noteTone="amber" />
      </div>

      <div className="grid split mt">
        <Card title="Xu hướng doanh thu gói" subtitle="6 tháng gần đây · đơn vị: triệu đồng">
          <BarChart data={revenueTrend} format={(v) => v.toLocaleString('vi-VN')} />
        </Card>
        <Card title="Cơ cấu gói">
          <div className="kv" style={{ border: 0, paddingBottom: 0 }}>
            <b>LOOKSY Plus</b>
            <span>274 gói</span>
          </div>
          <div className="progress"><i style={{ width: '71%' }} /></div>
          <div className="kv" style={{ border: 0, paddingTop: 0, paddingBottom: 0 }}>
            <b>LOOKSY Premium</b>
            <span>112 gói</span>
          </div>
          <div className="progress pink"><i style={{ width: '29%' }} /></div>
          <div className="legend" style={{ justifyContent: 'flex-start' }}>
            <span><i className="dot" style={{ background: '#9440dd' }} />Plus 71%</span>
            <span><i className="dot" style={{ background: '#db607e' }} />Premium 29%</span>
          </div>
        </Card>
      </div>

      <Card
        className="mt"
        title="Giao dịch gói gần đây"
        action={<button type="button" className="link" onClick={() => showToast('Tính năng đối soát sẽ có khi nối API')}>Đối soát giao dịch</button>}
      >
        <table>
          <thead>
            <tr>
              <th>Mã giao dịch</th>
              <th>Gói</th>
              <th>Ngày</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.code}>
                <td className="strong">{t.code}</td>
                <td>{t.plan}</td>
                <td>{t.date}</td>
                <td>{t.amount}</td>
                <td><Badge>{t.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="footnote">Số liệu minh họa cho wireframe; không chứa thông tin thanh toán cá nhân.</p>
      </Card>
    </>
  );
}
