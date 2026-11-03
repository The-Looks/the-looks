import {
  AppstoreOutlined, AuditOutlined, BarChartOutlined, BellOutlined, CloudSyncOutlined,
  HeartOutlined, LinkOutlined, MenuOutlined, SettingOutlined, ShoppingOutlined, TeamOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, Card, Input, Table, Tag } from 'antd';
import { useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Brand } from '../../../components/shared/ui/index';
import { errorMessage } from '../../../services/shared/api/client';
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
  const choose = (next: View) => { setParams(next === 'overview' ? {} : { view: next }); setMobileNav(false); };

  return <div className="admin-frame">
    <aside className={`admin-sidebar${mobileNav ? ' admin-sidebar-open' : ''}`}>
      <Link to="/" className="admin-brand"><Brand /></Link>
      <nav aria-label="Điều hướng quản trị">{nav.map((group) => <div className="admin-nav-group" key={group.heading}><span>{group.heading}</span>{group.items.map((item) => <button key={item.key} className={`admin-nav-item${view === item.key ? ' active' : ''}`} onClick={() => choose(item.key)}>{item.icon}{item.label}</button>)}</div>)}</nav>
      <Link to="/" className="admin-account"><Avatar>AD</Avatar><span><strong>THE LOOKS</strong><small>Quản trị viên</small></span></Link>
    </aside>
    <div className="admin-content"><header className="admin-topbar"><div className="admin-topbar-title"><Button className="admin-menu-button" icon={<MenuOutlined />} aria-label="Mở menu" onClick={() => setMobileNav((value) => !value)} /><span>Quản trị / {titles[view]}</span><strong>{titles[view]}</strong></div><div className="admin-topbar-actions"><Avatar>AD</Avatar></div></header>
      <main className="admin-page"><div className="admin-page-intro"><Link to="/" className="admin-text-button">‹ Quay lại trang chủ</Link><h1>{titles[view]}</h1><p>{view === 'overview' ? 'Số liệu đang được lấy trực tiếp từ các service.' : 'Thông tin quản trị từ hệ thống.'}</p></div>
        <div className="admin-view-content" key={view}>
          {view === 'overview' && <AiUsagePanel />}
          {view === 'users' && <UsersPanel />}
          {view !== 'overview' && view !== 'users' && <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>{titles[view]}</h2><p>Chưa có API quản trị cho mục này.</p></div></div><p className="muted">Mục này sẽ hiển thị khi backend cung cấp dữ liệu thật. Hiện chưa có thống kê để hiển thị.</p></Card>}
        </div>
      </main>
    </div>
  </div>;
}
