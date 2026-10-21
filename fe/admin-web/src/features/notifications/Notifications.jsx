import { useMemo, useState } from 'react';
import Icon from '../../shared/ui/Icon.jsx';
import { Badge, Card, Modal, PageHead, StatCard, Tabs } from '../../shared/ui/Ui.jsx';
import { useStore } from '../../shared/store.jsx';

const AUDIENCES = ['Tất cả User', 'User có kết nối', 'User tương tác', 'User mới'];

export default function Notifications() {
  const { campaigns, addCampaign, showToast } = useStore();
  const [tab, setTab] = useState('all');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [schedule, setSchedule] = useState('');

  const rows = useMemo(
    () => campaigns.filter((c) => tab === 'all' || c.status === tab),
    [campaigns, tab],
  );
  const scheduled = campaigns.filter((c) => c.status === 'Lên lịch').length;

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addCampaign({
      title: title.trim(),
      audience,
      schedule: schedule.trim() || 'Chưa đặt lịch',
      status: schedule.trim() ? 'Lên lịch' : 'Bản nháp',
    });
    setOpen(false);
    setTitle('');
    setSchedule('');
    showToast('Đã tạo thông báo');
  };

  return (
    <>
      <PageHead
        crumb="Quản trị / Thông báo"
        title="Quản lý thông báo"
        subtitle="Soạn và theo dõi thông báo gửi tới người dùng ứng dụng."
      />
      <div className="grid c3">
        <StatCard icon="bell" value="12" label="Đã gửi tháng này" note="Chiến dịch" />
        <StatCard icon="clock" value={scheduled} label="Đang lên lịch" note="Chờ thời điểm gửi" noteTone="amber" />
        <StatCard icon="trend" value="62,4%" label="Tỉ lệ mở" note="30 ngày gần đây" noteTone="green" />
      </div>

      <Card
        className="mt"
        title="Chiến dịch thông báo"
        subtitle="Nội dung gửi hàng loạt cần được duyệt trước khi phát hành."
        action={
          <button type="button" className="btn primary sm" onClick={() => setOpen(true)}>
            <Icon name="plus" size={14} /> Tạo thông báo
          </button>
        }
      >
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'all', label: 'Tất cả' },
            { value: 'Đã gửi', label: 'Đã gửi' },
            { value: 'Lên lịch', label: 'Lên lịch' },
            { value: 'Bản nháp', label: 'Bản nháp' },
          ]}
        />
        <table>
          <thead>
            <tr>
              <th>Thông báo</th>
              <th>Đối tượng</th>
              <th>Lịch gửi</th>
              <th>Người tạo</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="strong">{c.title}</td>
                <td>{c.audience}</td>
                <td>{c.schedule}</td>
                <td>{c.creator}</td>
                <td><Badge>{c.status}</Badge></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="5">Chưa có thông báo nào.</td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="footnote">Tất cả thời gian và số liệu đều là dữ liệu minh họa cho wireframe.</p>
      </Card>

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <h3>Tạo thông báo</h3>
          <p className="sub">Bỏ trống lịch gửi để lưu thành bản nháp.</p>
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="ntitle">Tiêu đề</label>
              <input id="ntitle" className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="naud">Đối tượng</label>
              <select id="naud" className="select" value={audience} onChange={(e) => setAudience(e.target.value)}>
                {AUDIENCES.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="nsch">Lịch gửi</label>
              <input id="nsch" className="input" placeholder="VD: 20/10 · 18:00" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setOpen(false)}>Hủy</button>
              <button type="submit" className="btn primary">Tạo</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
