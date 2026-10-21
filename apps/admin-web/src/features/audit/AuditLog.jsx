import { useMemo, useState } from 'react';
import { Badge, Card, PageHead } from '../../shared/ui/Ui.jsx';
import { useStore } from '../../shared/store.jsx';

export default function AuditLog() {
  const { audit } = useStore();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('Tất cả');

  const types = useMemo(() => ['Tất cả', ...new Set(audit.map((a) => a.action))], [audit]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return audit.filter(
      (a) =>
        (type === 'Tất cả' || a.action === type) &&
        (!q || a.user.toLowerCase().includes(q) || a.admin.toLowerCase().includes(q)),
    );
  }, [audit, query, type]);

  return (
    <>
      <PageHead
        crumb="Quản trị / Nhật ký"
        title="Nhật ký thao tác"
        subtitle="Theo dõi thay đổi trạng thái tài khoản do Admin thực hiện."
      />
      <Card
        title="Lịch sử thao tác"
        subtitle="Mọi thao tác quản lý tài khoản đều được lưu lại để đối chiếu."
      >
        <div className="toolbar">
          <input
            className="input"
            placeholder="Tìm người dùng hoặc Admin..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="select" value={type} onChange={(e) => setType(e.target.value)} aria-label="Loại thao tác">
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người thực hiện</th>
              <th>Thao tác</th>
              <th>Người dùng</th>
              <th>Kết quả</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a, i) => (
              <tr key={a.time + a.user + i}>
                <td>{a.time}</td>
                <td className="strong">{a.admin}</td>
                <td className="strong">{a.action}</td>
                <td>{a.user}</td>
                <td><Badge>{a.result}</Badge></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="5">Chưa có thao tác nào phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="table-foot">
          <span>Hiển thị {rows.length} hoạt động gần đây</span>
          <button type="button" className="link">Xem thêm ›</button>
        </div>
      </Card>
    </>
  );
}
