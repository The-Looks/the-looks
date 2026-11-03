import {
  AppstoreOutlined, AuditOutlined, BarChartOutlined, BellOutlined, CloudSyncOutlined,
  HeartOutlined, HomeOutlined, LinkOutlined, LockOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  SettingOutlined, ShoppingOutlined, TeamOutlined, UserAddOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, Card, Input, Skeleton, Table, Tag } from 'antd';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Brand } from '../../../components/shared/ui/index';
import { AccountDrawer } from '../../../components/shared/layout/AccountDrawer';
import { errorMessage } from '../../../services/shared/api/client';
import { authRequests } from '../../../services/guest/auth/requests';
import { useAiUsage } from '../../../hooks/admin/dashboard/useAiUsage';
import { listAdminUsers } from '../../../services/admin/dashboard/users';
import type { AdminUser } from '../../../interface/dto/admin/auth/AdminUsers';
import './admin-dashboard.css';

type View = 'overview' | 'users' | 'content' | 'products' | 'sync' | 'notifications' | 'audit' | 'settings' | 'revenue' | 'affiliate';
const nav: { heading: string; items: { key: View; label: string; icon: ReactNode }[] }[] = [
  { heading: 'TỔNG QUAN', items: [{ key: 'overview', label: 'Tổng quan', icon: <AppstoreOutlined /> }] },
  { heading: 'QUẢN LÝ', items: [
    { key: 'users', label: 'Người dùng', icon: <TeamOutlined /> },
    { key: 'content', label: 'Nội dung', icon: <HeartOutlined /> },
    { key: 'products', label: 'Sản phẩm', icon: <ShoppingOutlined /> },
    { key: 'sync', label: 'Đồng bộ', icon: <CloudSyncOutlined /> },
  ] },
  { heading: 'VẬN HÀNH', items: [
    { key: 'notifications', label: 'Thông báo', icon: <BellOutlined /> },
    { key: 'audit', label: 'Nhật ký', icon: <AuditOutlined /> },
    { key: 'settings', label: 'Cài đặt', icon: <SettingOutlined /> },
  ] },
  { heading: 'DOANH THU', items: [
    { key: 'revenue', label: 'Doanh thu gói', icon: <BarChartOutlined /> },
    { key: 'affiliate', label: 'Affiliate', icon: <LinkOutlined /> },
  ] },
];
const titles: Record<View, string> = Object.fromEntries(nav.flatMap((group) => group.items.map((item) => [item.key, item.label]))) as Record<View, string>;

function AiUsagePanel() {
  const usage = useAiUsage();
  const report = usage.data;
  const percent = report?.budgetUsd ? Math.min(100, Math.round(report.costUsd / report.budgetUsd * 100)) : 0;
  return <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Chi phí LOOKSY AI</h2><p>Dữ liệu từ outfit-service trong tháng hiện tại</p></div></div>
    {usage.isPending && <p>Đang tải chi phí AI…</p>}
    {usage.isError && <p role="alert">{errorMessage(usage.error)}</p>}
    {report && <><div className="admin-progress-label">{report.month} <strong>${report.costUsd.toFixed(2)} / ${report.budgetUsd.toFixed(2)}</strong></div>
      <div className="admin-progress"><span style={{ width: `${percent}%` }} /></div>
      <p className="small muted">{report.topUsers.length} người dùng có phát sinh chi phí AI trong báo cáo.</p></>}
  </Card>;
}

function AdminMetric({ icon, label, value, note, tone = '' }: { icon: ReactNode; label: string; value: number | null; note: string; tone?: string }) {
  return <Card className={`admin-metric ${tone}`}>
    <span className="admin-metric-icon">{icon}</span>
    <strong>{value === null ? '—' : value.toLocaleString('vi-VN')}</strong>
    <span>{label}</span><small>{note}</small>
  </Card>;
}

function OverviewPanel({ onOpenUsers }: { onOpenUsers: () => void }) {
  const users = useQuery({ queryKey: ['admin', 'users', 'overview'], queryFn: () => listAdminUsers(0, '', 100) });
  const page = users.data;
  const sample = page?.items ?? [];
  const active = sample.filter((user) => user.status === 'ACTIVE').length;
  const locked = sample.filter((user) => user.status === 'LOCKED').length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + index);
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    return {
      label: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      count: sample.filter((user) => {
        const joined = Date.parse(user.createdAt);
        return joined >= date.getTime() && joined < next.getTime();
      }).length,
    };
  });
  const newThisWeek = days.reduce((sum, day) => sum + day.count, 0);
  const maxDaily = Math.max(1, ...days.map((day) => day.count));
  const activePercent = sample.length ? Math.round(active / sample.length * 100) : null;
  const sampleNote = page ? `Trong ${sample.length} tài khoản gần nhất` : 'Chờ dữ liệu từ auth-service';

  return <div className="admin-overview">
    {users.isError && <Card className="admin-panel"><p role="alert">Không tải được dữ liệu người dùng: {errorMessage(users.error)}</p></Card>}
    {users.isPending ? <div className="admin-metrics">{Array.from({ length: 4 }, (_, index) => <Card key={index} className="admin-metric"><Skeleton active paragraph={{ rows: 2 }} title={false} /></Card>)}</div> : <div className="admin-metrics">
      <AdminMetric icon={<TeamOutlined />} label="Tổng người dùng" value={page?.total ?? null} note="Toàn hệ thống" />
      <AdminMetric icon={<AppstoreOutlined />} label="Đang hoạt động" value={page ? active : null} note={sampleNote} tone="admin-tone-green" />
      <AdminMetric icon={<UserAddOutlined />} label="Mới trong 7 ngày" value={page ? newThisWeek : null} note={sampleNote} tone="admin-tone-pink" />
      <AdminMetric icon={<LockOutlined />} label="Tạm khóa" value={page ? locked : null} note={sampleNote} tone="admin-tone-amber" />
    </div>}

    <div className="admin-two-col">
      <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Tăng trưởng người dùng</h2><p>Số tài khoản mới trong 7 ngày · {sampleNote.toLowerCase()}</p></div></div>
        {users.isPending ? <Skeleton active paragraph={{ rows: 5 }} /> : sample.length ? <div className="admin-chart-wrap"><div className="admin-chart" role="img" aria-label={`Người dùng mới trong 7 ngày: ${days.map((day) => `${day.date}: ${day.count}`).join(', ')}`}>
          {days.map((day) => <div className="admin-chart-column" key={day.date} title={`${day.date}: ${day.count} người dùng`}><span style={{ height: `${day.count / maxDaily * 100}%` }} /><small>{day.label}</small></div>)}
        </div></div> : <div className="admin-empty">Chưa có tài khoản để hiển thị biểu đồ.</div>}
      </Card>
      <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Trạng thái tài khoản</h2><p>{sampleNote}</p></div></div>
        {users.isPending ? <Skeleton active paragraph={{ rows: 5 }} /> : sample.length ? <>
          <div className="admin-donut" role="img" aria-label={`${activePercent}% hoạt động, ${100 - (activePercent ?? 0)}% tạm khóa`} style={{ background: `conic-gradient(var(--purple) 0 ${activePercent}%, var(--pink) ${activePercent}% 100%)` }}><div><strong>{activePercent}%</strong><small>Hoạt động</small></div></div>
          <div className="admin-legend"><span>Hoạt động: {active}</span><span>Tạm khóa: {locked}</span></div>
        </> : <div className="admin-empty">Chưa có tài khoản để thống kê trạng thái.</div>}
      </Card>
    </div>

    <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Người dùng mới</h2><p>{sample.length ? 'Tài khoản được tạo gần đây' : 'Chưa có tài khoản mới'}</p></div><button className="admin-text-button" type="button" onClick={onOpenUsers}>Xem tất cả →</button></div>
      <Table<AdminUser> rowKey="id" loading={users.isPending} dataSource={sample.slice(0, 5)} pagination={false} scroll={{ x: 650 }}
        columns={[{ title: 'Người dùng', dataIndex: 'username' }, { title: 'Email', dataIndex: 'email' },
          { title: 'Ngày tham gia', dataIndex: 'createdAt', render: (value: string) => new Date(value).toLocaleDateString('vi-VN') },
          { title: 'Trạng thái', dataIndex: 'status', render: (status: string) => <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}</Tag> }]}
        locale={{ emptyText: 'Chưa có dữ liệu người dùng' }} />
    </Card>
    <AiUsagePanel />
  </div>;
}

function UsersPanel() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const users = useQuery({ queryKey: ['admin', 'users', page, query], queryFn: () => listAdminUsers(page, query) });
  return <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Danh sách người dùng</h2><p>{users.data ? `${users.data.total} tài khoản trong hệ thống` : 'Dữ liệu từ auth-service'}</p></div></div>
    <form className="admin-toolbar" onSubmit={(event) => { event.preventDefault(); setPage(0); setQuery(search.trim()); }}><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên hoặc email" aria-label="Tìm người dùng" /><Button htmlType="submit">Tìm</Button></form>
    {users.isError && <p role="alert">{errorMessage(users.error)}</p>}
    <Table<AdminUser> rowKey="id" loading={users.isPending} dataSource={users.data?.items ?? []} scroll={{ x: 760 }}
      pagination={{ current: page + 1, pageSize: users.data?.size ?? 10, total: users.data?.total ?? 0, onChange: (next) => setPage(next - 1) }}
      columns={[
        { title: 'Người dùng', dataIndex: 'username' }, { title: 'Email', dataIndex: 'email' },
        { title: 'Ngày tham gia', dataIndex: 'createdAt', render: (value: string) => new Date(value).toLocaleDateString('vi-VN') },
        { title: 'Xác minh', dataIndex: 'emailVerified', render: (verified: boolean) => verified ? 'Đã xác minh' : 'Chưa xác minh' },
        { title: 'Trạng thái', dataIndex: 'status', render: (status: string) => <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}</Tag> },
      ]} />
  </Card>;
}

export function AdminDashboardPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('view');
  const view: View = requested && Object.hasOwn(titles, requested) ? requested as View : 'overview';
  const [mobileNav, setMobileNav] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const me = useQuery({ queryKey: ['me'], queryFn: authRequests.me });
  const avatarLetter = me.data?.username?.slice(0, 1).toUpperCase() ?? 'A';
  const choose = (next: View) => { setParams(next === 'overview' ? {} : { view: next }); setMobileNav(false); };

  useEffect(() => {
    if (!mobileNav) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileNav(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileNav]);

  return <div className={`admin-frame${collapsed ? ' admin-frame-collapsed' : ''}`}>
    {mobileNav && <button className="admin-sidebar-scrim" type="button" aria-label="Đóng thanh điều hướng" onClick={() => setMobileNav(false)} />}
    <aside id="admin-sidebar" className={`admin-sidebar${mobileNav ? ' admin-sidebar-open' : ''}`}>
      <div className="admin-brand-row"><Link to="/" className="admin-brand" aria-label="THE LOOKS, về trang chủ"><Brand /><strong>THE LOOKS</strong></Link><button className="admin-sidebar-close" type="button" aria-label="Đóng menu" onClick={() => setMobileNav(false)}><MenuFoldOutlined /></button></div>
      <nav aria-label="Điều hướng quản trị">{nav.map((group) => <div className="admin-nav-group" key={group.heading}><span className="admin-nav-heading">{group.heading}</span>{group.items.map((item) => <button key={item.key} type="button" title={item.label} aria-current={view === item.key ? 'page' : undefined} className={`admin-nav-item${view === item.key ? ' active' : ''}`} onClick={() => choose(item.key)}>{item.icon}<span className="admin-nav-label">{item.label}</span></button>)}</div>)}</nav>
    </aside>
    <div className="admin-content"><header className="admin-topbar"><div className="admin-topbar-left">
      <button className="admin-collapse-button" type="button" aria-label={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'} aria-controls="admin-sidebar" aria-expanded={!collapsed} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}</button>
      <button className="admin-menu-button" type="button" aria-label="Mở menu" aria-controls="admin-sidebar" aria-expanded={mobileNav} onClick={() => setMobileNav((value) => !value)}><MenuUnfoldOutlined /></button>
      <div className="admin-topbar-title"><span>Quản trị / {titles[view]}</span><Link to="/" className="admin-topbar-back"><HomeOutlined /> Quay lại trang chủ</Link></div>
    </div><div className="admin-topbar-actions">
      <button type="button" className="admin-notification-button" aria-label="Xem thông báo quản trị" onClick={() => choose('notifications')}><BellOutlined /></button>
      <button type="button" className="topbar-avatar-trigger admin-avatar-trigger" aria-label="Mở menu tài khoản" aria-controls="account-drawer" aria-expanded={accountOpen} onClick={() => setAccountOpen(true)}><Avatar className="user-avatar">{avatarLetter}</Avatar></button>
    </div></header>
      <main className="admin-page"><div className="admin-page-intro"><h1>{titles[view]}</h1><p>{view === 'overview' ? 'Số liệu được lấy trực tiếp từ các service.' : 'Thông tin quản trị từ hệ thống.'}</p></div>
        <div className="admin-view-content" key={view}>
          {view === 'overview' && <OverviewPanel onOpenUsers={() => choose('users')} />}
          {view === 'users' && <UsersPanel />}
          {view !== 'overview' && view !== 'users' && <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>{titles[view]}</h2><p>Chưa có API quản trị cho mục này.</p></div></div><p className="muted">Mục này sẽ hiển thị khi backend cung cấp dữ liệu thật. Hiện chưa có thống kê để hiển thị.</p></Card>}
        </div>
      </main>
    </div>
    <AccountDrawer open={accountOpen} onClose={() => setAccountOpen(false)} account={me.data} isAdmin />
  </div>;
}
