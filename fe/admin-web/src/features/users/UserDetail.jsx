import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Icon from '../../shared/ui/Icon.jsx';
import { Avatar, Badge, Card, Modal, PageHead } from '../../shared/ui/Ui.jsx';
import { userActivity } from '../../shared/mock.js';
import { useStore } from '../../shared/store.jsx';

const REASONS = ['Vi phạm quy tắc cộng đồng', 'Tài khoản spam hoặc giả mạo', 'Yêu cầu từ chủ tài khoản', 'Khác'];

export default function UserDetail() {
  const { id } = useParams();
  const { users, setUserStatus, log, showToast } = useStore();
  const [lockOpen, setLockOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const user = users.find((u) => u.id === id);

  if (!user) return <Navigate to="/users" replace />;
  const locked = user.status === 'Tạm khóa';

  const confirmLock = () => {
    if (!reason) return;
    setUserStatus(user.id, 'Tạm khóa', 'Khóa tài khoản');
    setLockOpen(false);
    setReason('');
    setNote('');
    showToast(`Đã khóa tài khoản ${user.name}`);
  };

  const unlock = () => {
    setUserStatus(user.id, 'Hoạt động', 'Mở khóa tài khoản');
    showToast(`Đã mở khóa tài khoản ${user.name}`);
  };

  const notify = () => {
    log('Gửi thông báo', user.name);
    showToast(`Đã gửi thông báo tới ${user.name}`);
  };

  return (
    <>
      <PageHead
        crumb="Quản trị / Người dùng"
        title="Chi tiết người dùng"
        subtitle="Thông tin tài khoản và thao tác quản trị."
      />
      <Link to="/users" className="back">‹ Quay lại danh sách</Link>

      <Card>
        <div className="profile-head">
          <Avatar name={user.name} large />
          <div className="grow">
            <div className="profile-name">
              <h2 style={{ fontSize: 20 }}>{user.name}</h2>
              <Badge>{user.status}</Badge>
            </div>
            <p className="page-sub">{user.email} · ID {user.id}</p>
          </div>
          <button type="button" className="btn" onClick={notify}>Gửi thông báo</button>
          {locked ? (
            <button type="button" className="btn primary" onClick={unlock}>Mở khóa tài khoản</button>
          ) : (
            <button type="button" className="btn danger" onClick={() => setLockOpen(true)}>Khóa tài khoản</button>
          )}
        </div>
        <div className="meta">
          <div><small>Ngày tham gia</small><b>{user.joined}</b></div>
          <div><small>Đăng nhập gần nhất</small><b>{user.lastActive === 'Hôm nay' ? 'Hôm nay, 09:42' : user.lastActive}</b></div>
          <div><small>Vai trò</small><b>User</b></div>
          <div><small>Nguồn đăng ký</small><b>Ứng dụng mobile</b></div>
        </div>
      </Card>

      <div className="grid c2 mt">
        <Card title="Tổng quan tài khoản" subtitle="Chỉ số tổng hợp, không hiển thị tủ đồ riêng tư.">
          <div className="grid c3" style={{ marginBottom: 18 }}>
            {[
              ['68', 'Món đồ đã lưu'],
              ['22', 'Outfit đã tạo'],
              ['12', 'Bình chọn đã đăng'],
            ].map(([v, l]) => (
              <div key={l} style={{ background: 'var(--lavender-soft)', borderRadius: 12, padding: 14 }}>
                <div className="stat-value t-purple">{v}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>
          <h4 style={{ fontSize: 15, marginBottom: 6 }}>Thông tin tài khoản</h4>
          <div className="kv"><span>Họ và tên</span><b>{user.name}</b></div>
          <div className="kv"><span>Email</span><b>{user.email}</b></div>
          <div className="kv"><span>Trạng thái email</span><b>{user.status === 'Chờ xác minh' ? 'Chưa xác minh' : 'Đã xác minh'}</b></div>
          <div className="kv"><span>Phương thức đăng nhập</span><b>Email và mật khẩu</b></div>
        </Card>

        <Card title="Hoạt động gần đây">
          <ul className="timeline">
            {userActivity.map((a) => (
              <li key={a.time + a.text}>
                <i />
                <div>
                  {a.text}
                  <small>{a.time}</small>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {lockOpen && (
        <Modal onClose={() => setLockOpen(false)}>
          <div className="modal-icon"><Icon name="lock" size={22} /></div>
          <h3>Xác nhận khóa tài khoản</h3>
          <p className="sub">Bạn sắp khóa tài khoản {user.name}.</p>
          <div className="chip-box">
            {user.id} · {user.email}
            <small>Vai trò: User · Hiện tại: {user.status}</small>
          </div>
          <div className="field">
            <label htmlFor="reason">Lý do khóa</label>
            <select id="reason" className="select" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Chọn lý do</option>
              {REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="note">Ghi chú nội bộ</label>
            <textarea id="note" className="textarea" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <p className="warn">Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa.</p>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={() => setLockOpen(false)}>Hủy</button>
            <button type="button" className="btn danger" disabled={!reason} style={{ opacity: reason ? 1 : 0.5 }} onClick={confirmLock}>
              Xác nhận khóa
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
