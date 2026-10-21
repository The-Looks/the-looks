import { useMemo, useState } from 'react';
import { Badge, Card, PageHead, StatCard, Tabs } from '../../shared/ui/Ui.jsx';
import { useStore } from '../../shared/store.jsx';

// 12 mục chờ duyệt còn lại nằm ngoài 6 dòng đang hiển thị (theo wireframe: 18 mục).
const HIDDEN_PENDING = 12;

export default function Content() {
  const { content, resolveContent } = useStore();
  const [tab, setTab] = useState('all');

  const count = (type) => content.filter((c) => c.type === type).length;
  const rows = useMemo(
    () => content.filter((c) => tab === 'all' || c.type === tab),
    [content, tab],
  );
  const pending = HIDDEN_PENDING + content.length;

  return (
    <>
      <PageHead
        crumb="Quản trị / Nội dung"
        title="Duyệt nội dung"
        subtitle="Xem báo cáo đối với bình chọn, bình luận và nội dung được chia sẻ."
      />
      <div className="grid c3">
        <StatCard icon="doc" value={pending} label="Chờ duyệt" note="Bài và bình luận" />
        <StatCard icon="check" value={42 + (18 - pending > 0 ? 18 - pending : 0)} label="Đã xử lý hôm nay" note="Từ cộng đồng" noteTone="green" />
        <StatCard icon="alert" value="7" label="Báo cáo mới" note="Cần ưu tiên" noteTone="pink" />
      </div>

      <div className="grid split mt">
        <Card title="Hàng đợi kiểm duyệt">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'all', label: `Tất cả · ${pending}` },
              { value: 'Bình chọn', label: `Bình chọn · ${8 - 5 + count('Bình chọn')}` },
              { value: 'Bình luận', label: `Bình luận · ${6 - 4 + count('Bình luận')}` },
              { value: 'Báo cáo', label: `Báo cáo · ${4 - 1 + count('Báo cáo')}` },
            ]}
          />
          <table>
            <thead>
              <tr>
                <th>Loại nội dung</th>
                <th>Tóm tắt</th>
                <th>Người đăng</th>
                <th>Thời gian</th>
                <th>Mức ưu tiên</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="strong">{c.type}</td>
                  <td>{c.summary}</td>
                  <td>{c.author}</td>
                  <td>{c.time}</td>
                  <td><Badge>{c.priority}</Badge></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="btn sm" onClick={() => resolveContent(c.id, 'Duyệt nội dung')}>Duyệt</button>
                      <button type="button" className="btn sm danger" onClick={() => resolveContent(c.id, 'Gỡ nội dung')}>Gỡ</button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="6">Không còn mục nào trong hàng đợi này.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="table-foot">
            <span>Hiển thị {content.length} / {pending} mục chờ duyệt</span>
            <button type="button" className="link">Xem thêm ›</button>
          </div>
        </Card>

        <Card title="Quy tắc kiểm duyệt">
          <p className="card-sub" style={{ fontSize: 13 }}>
            Chỉ nội dung do User chia sẻ hoặc bị báo cáo mới xuất hiện tại đây.
          </p>
          <div className="kv"><span>Ưu tiên cao</span><b>Báo cáo trùng lặp, hình ảnh nhạy cảm</b></div>
          <div className="kv"><span>Ưu tiên trung bình</span><b>Bình chọn mới được chia sẻ</b></div>
          <div className="kv"><span>Ưu tiên thấp</span><b>Quảng cáo, nội dung lặp lại</b></div>
        </Card>
      </div>
    </>
  );
}
