import { useState } from 'react';
import Icon from '../../shared/ui/Icon.jsx';
import { Badge, Card, PageHead } from '../../shared/ui/Ui.jsx';
import { syncIssues } from '../../shared/mock.js';
import { useStore } from '../../shared/store.jsx';

const SOURCES = [
  { name: 'Shopee', products: '8.420', updated: '14/10 · 10:30' },
  { name: 'TikTok Shop', products: '5.186', updated: '14/10 · 10:24' },
];

export default function Sync() {
  const { showToast } = useStore();
  const [issues, setIssues] = useState(syncIssues);

  return (
    <>
      <PageHead
        crumb="Quản trị / Đồng bộ"
        title="Quản lý đồng bộ"
        subtitle="Theo dõi kết nối cửa hàng ở mức hệ thống, không hiển thị đơn hàng riêng tư."
      />
      <div className="grid c2">
        {SOURCES.map((s) => (
          <Card key={s.name}>
            <div className="card-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="stat-icon"><Icon name="bag" /></div>
                <h3 className="card-title">{s.name}</h3>
              </div>
              <Badge tone="green">Ổn định</Badge>
            </div>
            <div className="stat-value">{s.products}</div>
            <div className="stat-label">Sản phẩm đang đồng bộ</div>
            <div className="table-foot">
              <span>Lần cập nhật: {s.updated}</span>
              <button type="button" className="link" onClick={() => showToast(`Đã yêu cầu đồng bộ lại ${s.name}`)}>
                Đồng bộ lại ›
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card
        className="mt"
        title="Sự cố đồng bộ cần xử lý"
        subtitle="Theo dõi lỗi dữ liệu và khả năng kết nối của từng nguồn."
        action={<Badge tone="amber">{issues.length} cảnh báo</Badge>}
      >
        <table>
          <thead>
            <tr>
              <th>Nguồn</th>
              <th>Vấn đề</th>
              <th>Ảnh hưởng</th>
              <th>Phát hiện</th>
              <th>Mức độ</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {issues.map((i) => (
              <tr key={i.source + i.issue}>
                <td className="strong">{i.source}</td>
                <td>{i.issue}</td>
                <td>{i.impact}</td>
                <td>{i.found}</td>
                <td><Badge>{i.level}</Badge></td>
                <td>
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => {
                      setIssues((prev) => prev.filter((x) => x !== i));
                      showToast('Đã đánh dấu đã xử lý');
                    }}
                  >
                    Đã xử lý
                  </button>
                </td>
              </tr>
            ))}
            {issues.length === 0 && (
              <tr>
                <td colSpan="6">Không còn sự cố đồng bộ.</td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="footnote">
          Admin chỉ thấy số liệu tổng hợp và lỗi kết nối; dữ liệu mua hàng cá nhân được bảo vệ.
        </p>
      </Card>
    </>
  );
}
