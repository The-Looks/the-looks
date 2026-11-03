import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../shared/ui/Icon.jsx';
import { Avatar, Badge, Card, PageHead, StatCard } from '../../shared/ui/Ui.jsx';
import { useStore } from '../../shared/store.jsx';

function exportCsv(rows) {
  const header = ['ID', 'Người dùng', 'Email', 'Ngày tham gia', 'Hoạt động gần nhất', 'Trạng thái'];
  const body = rows.map((u) => [u.id, u.name, u.email, u.joined, u.lastActive, u.status]);
  const csv = [header, ...body].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'danh-sach-nguoi-dung.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function Users() {
  const { users, showToast } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Tất cả');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        (status === 'Tất cả' || u.status === status) &&
        (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
    );
  }, [users, query, status]);

  return (
    <>
      <PageHead
        crumb="Quản trị / Người dùng"
        title="Quản lý người dùng"
        subtitle="Tìm kiếm, xem thông tin và kiểm soát trạng thái tài khoản."
      />
      <div className="grid c4">
        <StatCard icon="users" value="12.480" label="Tổng tài khoản" note="Tất cả" />
        <StatCard icon="trend" value="9.842" label="Hoạt động" note="78,9%" noteTone="green" />
        <StatCard icon="clock" value="164" label="Chờ xác minh" note="Cần theo dõi" noteTone="amber" />
        <StatCard icon="lock" value="38" label="Tạm khóa" note="0,3%" noteTone="pink" />
      </div>

      <Card
        className="mt"
        title="Danh sách người dùng"
        subtitle="Dữ liệu minh họa · chỉ hiển thị thông tin tài khoản"
        action={
          <button
            type="button"
            className="btn sm"
            onClick={() => {
              exportCsv(rows);
              showToast('Đã xuất danh sách người dùng');
            }}
          >
            <Icon name="download" size={14} /> Xuất danh sách
          </button>
        }
      >
        <div className="toolbar">
          <input
            className="input"
            placeholder="Tìm tên hoặc email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {['Tất cả', 'Hoạt động', 'Chờ xác minh', 'Tạm khóa'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Ngày tham gia</th>
              <th>Hoạt động gần nhất</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="clickable" onClick={() => navigate(`/users/${u.id}`)}>
                <td>
                  <div className="user-cell">
                    <Avatar name={u.name} />
                    <span className="strong">{u.name}</span>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>{u.joined}</td>
                <td>{u.lastActive}</td>
                <td><Badge>{u.status}</Badge></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="5">Không tìm thấy người dùng phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="table-foot">
          <span>Hiển thị 1–{rows.length} / 12.480 người dùng</span>
          <div className="pager">
            <span>‹</span>
            <span className="on">1</span>
            <span>2</span>
            <span>3</span>
            <span>…</span>
          </div>
        </div>
      </Card>
    </>
  );
}
