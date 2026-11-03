import {
  AppstoreOutlined, AuditOutlined, BarChartOutlined, BellOutlined, CheckCircleOutlined,
  ClockCircleOutlined, CloudSyncOutlined, CrownOutlined, DollarOutlined, DownloadOutlined,
  HeartOutlined, LinkOutlined, LockOutlined, MenuOutlined, NotificationOutlined,
  SearchOutlined, SettingOutlined, ShoppingOutlined, TeamOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Input, Modal, Select, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Brand } from '../../../components/shared/ui/index';
import { errorMessage } from '../../../services/shared/api/client';
import { useAiUsage } from '../../../hooks/admin/dashboard/useAiUsage';
import { adminAudit, adminProducts, adminReports, adminUsers, type AdminUser } from '../../../services/admin/dashboard/adminDemoData';
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
const titles: Record<View, string> = {
  overview: 'Tổng quan', users: 'Quản lý người dùng', content: 'Duyệt nội dung', products: 'Quản lý sản phẩm',
  sync: 'Quản lý đồng bộ', notifications: 'Quản lý thông báo', audit: 'Nhật ký thao tác',
  settings: 'Cài đặt quản trị', revenue: 'Doanh thu gói', affiliate: 'Doanh thu affiliate',
};
const descriptions: Record<View, string> = {
  overview: 'Theo dõi các số liệu cộng đồng và các tài khoản cần hỗ trợ.',
  users: 'Tìm kiếm, xem thông tin và trạng thái tài khoản.',
  content: 'Xem báo cáo đối với bình chọn, bình luận và nội dung được chia sẻ.',
  products: 'Kiểm soát sản phẩm hiển thị trong Tủ đồ và mua sắm.',
  sync: 'Theo dõi kết nối cửa hàng, đồng bộ và lỗi đơn hàng.',
  notifications: 'Soạn và theo dõi thông báo gửi tới người dùng ứng dụng.',
  audit: 'Theo dõi thay đổi trạng thái tài khoản do admin thực hiện.',
  settings: 'Thiết lập quyền truy cập và quy tắc vận hành hệ thống.',
  revenue: 'Theo dõi giao dịch ví, giao dịch và tình trạng thanh toán.',
  affiliate: 'Theo dõi hoa hồng từ kết nối mua sắm Shopee và TikTok Shop.',
};

function Status({ value }: { value: string }) {
  const tone = value === 'Hoạt động' || value === 'Hiển thị' || value === 'Thành công' || value === 'Đã gửi' || value === 'Đã đối soát'
    ? 'success' : value === 'Tạm khóa' || value === 'Cần sửa' || value === 'Cao' ? 'error' : 'warning';
  return <Tag className={`admin-status admin-status-${tone}`}>{value}</Tag>;
}

function Metric({ icon, number, label, note, tone = 'purple' }: { icon: ReactNode; number: string; label: string; note?: string; tone?: 'purple' | 'green' | 'pink' | 'amber' }) {
  return <Card className={`admin-metric admin-tone-${tone}`}><span className="admin-metric-icon">{icon}</span><strong>{number}</strong><span>{label}</span>{note && <small>{note}</small>}</Card>;
}

function Panel({ title, note, extra, children }: { title: string; note?: string; extra?: ReactNode; children: ReactNode }) {
  return <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>{title}</h2>{note && <p>{note}</p>}</div>{extra}</div>{children}</Card>;
}

function BarChart({ values, labels }: { values: number[]; labels: string[] }) {
  return <div className="admin-chart-wrap"><div className="admin-chart" role="img" aria-label={`Biểu đồ minh họa: ${labels.map((label, i) => `${label} ${values[i]}%`).join(', ')}`}>
    {values.map((height, index) => <div className="admin-chart-column" key={labels[index]}><span style={{ height: `${height}%` }} /><small>{labels[index]}</small></div>)}
  </div></div>;
}

function AiUsagePanel() {
  const usage = useAiUsage();
  const report = usage.data;
  const percent = report?.budgetUsd ? Math.min(100, Math.round(report.costUsd / report.budgetUsd * 100)) : 0;
  return <Panel title="Chi phí LOOKSY AI" note="Số liệu thực từ outfit-service trong tháng hiện tại">
    {usage.isPending && <p>Đang tải chi phí AI…</p>}
    {usage.isError && <p role="alert">{errorMessage(usage.error)}</p>}
    {report && <><div className="admin-progress-label">{report.month} <strong>${report.costUsd.toFixed(2)} / ${report.budgetUsd.toFixed(2)}</strong></div>
      <div className="admin-progress"><span style={{ width: `${percent}%` }} /></div>
      <p className="small muted">{report.topUsers.length} người dùng phát sinh chi phí AI nhiều nhất trong tháng.</p></>}
  </Panel>;
}

function Overview({ openUser }: { openUser: (user: AdminUser) => void }) {
  const recentColumns: ColumnsType<AdminUser> = [
    { title: 'Người dùng mới', dataIndex: 'name', render: (name: string, user) => <button className="admin-text-button" onClick={() => openUser(user)}>{name}</button> },
    { title: 'Email', dataIndex: 'email' }, { title: 'Ngày tham gia', dataIndex: 'joined' },
    { title: 'Trạng thái', dataIndex: 'status', render: (value: string) => <Status value={value} /> },
  ];
  return <>
    <div className="admin-metrics"><Metric icon={<TeamOutlined />} number="12.480" label="Tổng người dùng" note="+8,2% tháng này" />
      <Metric icon={<BarChartOutlined />} number="9.842" label="Đang hoạt động" note="78,9% tổng số" tone="green" />
      <Metric icon={<TeamOutlined />} number="312" label="Người dùng mới" note="7 ngày gần đây" tone="pink" />
      <Metric icon={<CrownOutlined />} number="18" label="Cần xem xét" note="Tài khoản" tone="amber" /></div>
    <div className="admin-two-col"><Panel title="Tăng trưởng người dùng" note="Số tài khoản mới trong 7 ngày" extra={<span className="admin-period">7 ngày qua</span>}><BarChart values={[38, 55, 47, 68, 61, 79, 96]} labels={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']} /></Panel>
      <Panel title="Trạng thái tài khoản" note="Phân bổ trạng thái hiện tại"><div className="admin-donut"><div><strong>78,9%</strong><small>Hoạt động</small></div></div><div className="admin-legend"><span>Hoạt động</span><span>Tạm khóa</span><span>Khác</span></div></Panel></div>
    <Panel title="Người dùng mới" note="Người dùng đăng ký gần đây" extra={<span className="admin-text-button">Xem trong mục Người dùng →</span>}><Table rowKey="key" columns={recentColumns} dataSource={adminUsers.slice(0, 3)} pagination={false} size="small" scroll={{ x: 650 }} /></Panel>
    <AiUsagePanel />
  </>;
}

function Users({ openUser }: { openUser: (user: AdminUser) => void }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const data = useMemo(() => adminUsers.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase()) && (status === 'all' || user.status === status)), [search, status]);
  const columns: ColumnsType<AdminUser> = [
    { title: 'Người dùng', dataIndex: 'name', render: (name: string, user) => <button className="admin-user-cell" onClick={() => openUser(user)}><Avatar>{name.slice(0, 1)}</Avatar><span><strong>{name}</strong><small>{user.key.padStart(4, '0')}</small></span></button> },
    { title: 'Email', dataIndex: 'email' }, { title: 'Ngày tham gia', dataIndex: 'joined' },
    { title: 'Hoạt động gần nhất', dataIndex: 'activity' },
    { title: 'Trạng thái', dataIndex: 'status', render: (value: string) => <Status value={value} /> },
    { title: '', key: 'detail', render: (_, user) => <Button type="link" onClick={() => openUser(user)}>Xem ›</Button> },
  ];
  return <><div className="admin-metrics"><Metric icon={<TeamOutlined />} number="12.480" label="Tổng tài khoản" note="Tất cả" />
    <Metric icon={<CheckCircleOutlined />} number="9.842" label="Hoạt động" note="78,9% tổng số" tone="green" />
    <Metric icon={<ClockCircleOutlined />} number="164" label="Chờ xác minh" note="Cần theo dõi" tone="amber" />
    <Metric icon={<LockOutlined />} number="38" label="Tạm khóa" note="0,3%" tone="pink" /></div>
    <Panel title="Danh sách người dùng" note="Dữ liệu mẫu để duyệt bố cục và thao tác" extra={<Button icon={<DownloadOutlined />} onClick={() => message.info('Chưa có API xuất danh sách người dùng.')}>Xuất danh sách</Button>}>
      <div className="admin-toolbar"><Input prefix={<SearchOutlined />} allowClear placeholder="Tìm tên hoặc email..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <Select value={status} onChange={setStatus} options={[{ value: 'all', label: 'Trạng thái' }, ...(['Hoạt động', 'Chờ xác minh', 'Tạm khóa'].map((value) => ({ value, label: value })))]} /></div>
      <Table rowKey="key" columns={columns} dataSource={data} pagination={{ pageSize: 8 }} scroll={{ x: 850 }} size="small" />
    </Panel></>;
}

function UserDetail({ user, onBack }: { user: AdminUser; onBack: () => void }) {
  const [lockOpen, setLockOpen] = useState(false);
  return <><button className="admin-text-button admin-back" onClick={onBack}>‹ Quay lại danh sách</button>
    <Panel title="Thông tin tài khoản" note="Thông tin mẫu theo thiết kế Figma" extra={<div className="admin-inline-actions"><Button onClick={() => message.info('Chưa có API gửi thông báo.')}>Gửi thông báo</Button><Button danger icon={<LockOutlined />} onClick={() => setLockOpen(true)}>Khóa tài khoản</Button></div>}>
      <div className="admin-profile"><Avatar size={62}>{user.name.slice(0, 1)}</Avatar><div><h2>{user.name}</h2><p>{user.email} · ID USER-{user.key.padStart(4, '0')}</p><Status value={user.status} /></div></div>
      <div className="admin-profile-facts"><span>Ngày tham gia <strong>{user.joined}</strong></span><span>Đăng nhập gần nhất <strong>{user.activity}</strong></span><span>Vai trò <strong>User</strong></span><span>Nguồn đăng ký <strong>Ứng dụng mobile</strong></span></div>
    </Panel>
    <div className="admin-two-col"><Panel title="Tổng quan tài khoản" note="Các chỉ số hoạt động trong bản mẫu"><div className="admin-mini-metrics"><div><strong>{user.wardrobe}</strong><small>Món đồ đã lưu</small></div><div><strong>{user.outfits}</strong><small>Outfit đã tạo</small></div><div><strong>{user.polls}</strong><small>Bình chọn đã đăng</small></div></div><h3>Thông tin tài khoản</h3><div className="admin-fact-list"><span>Họ và tên <strong>{user.name}</strong></span><span>Email <strong>{user.email}</strong></span><span>Trạng thái email <strong>Đã xác minh</strong></span><span>Phương thức đăng nhập <strong>Email và mật khẩu</strong></span></div></Panel>
      <Panel title="Hoạt động gần đây"><div className="admin-timeline"><span>Đăng nhập từ ứng dụng</span><span>Tạo outfit mới</span><span>Tham gia bình chọn</span><span>Xác minh email</span></div></Panel></div>
    <Modal open={lockOpen} title="Xác nhận khóa tài khoản" onCancel={() => setLockOpen(false)} footer={<><Button onClick={() => setLockOpen(false)}>Hủy</Button><Button danger disabled>Chưa có API khóa</Button></>}><p>Bạn sắp khóa tài khoản {user.name}.</p><Input placeholder="Chọn lý do và ghi chú nội bộ" disabled /><p className="admin-modal-note">Bản giao diện demo chưa thực hiện thay đổi tài khoản.</p></Modal>
  </>;
}

function Content() {
  const [kind, setKind] = useState('Tất cả');
  const reports = adminReports.filter((item) => kind === 'Tất cả' || item.type === kind);
  return <><div className="admin-metrics admin-three-metrics"><Metric icon={<CrownOutlined />} number="18" label="Chờ duyệt" note="Báo cáo mới" tone="amber" /><Metric icon={<CheckCircleOutlined />} number="42" label="Đã xử lý hôm nay" note="Từ cộng đồng" tone="green" /><Metric icon={<TeamOutlined />} number="7" label="Báo cáo mới" note="Cần ưu tiên" tone="pink" /></div>
    <Panel title="Hàng đợi kiểm duyệt" note="Chỉ hiển thị dữ liệu mẫu cho thiết kế" extra={<Button onClick={() => message.info('Quy tắc kiểm duyệt chưa có API cấu hình.')}>Quy tắc kiểm duyệt</Button>}>
      <div className="admin-filter-pills">{['Tất cả', 'Bình chọn', 'Bình luận', 'Bài viết'].map((value) => <button key={value} className={kind === value ? 'active' : ''} onClick={() => setKind(value)}>{value}</button>)}</div>
      <Table rowKey="key" dataSource={reports} pagination={false} size="small" scroll={{ x: 760 }} columns={[
        { title: 'Loại nội dung', dataIndex: 'type', render: (value: string) => <span className="admin-link-text">{value}</span> }, { title: 'Tóm tắt', dataIndex: 'title' },
        { title: 'Người đăng', dataIndex: 'reporter' }, { title: 'Thời gian', dataIndex: 'time' }, { title: 'Mức ưu tiên', dataIndex: 'priority', render: (value: string) => <Status value={value} /> },
      ]} />
    </Panel></>;
}

function Products() {
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('all');
  const rows = adminProducts.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) && (source === 'all' || item.source === source));
  return <><div className="admin-metrics admin-three-metrics"><Metric icon={<ShoppingOutlined />} number="1.246" label="Đang hiển thị" note="Sản phẩm" tone="green" /><Metric icon={<CrownOutlined />} number="82" label="Chờ kiểm tra" note="Trong nguồn mới" tone="amber" /><Metric icon={<TeamOutlined />} number="13" label="Cần sửa thông tin" note="Đã báo lỗi" tone="pink" /></div>
    <Panel title="Danh mục sản phẩm gần đây" note="Dữ liệu mẫu từ các nguồn liên kết" extra={<Button type="primary" disabled>Thêm sản phẩm</Button>}><div className="admin-toolbar"><Input prefix={<SearchOutlined />} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm sản phẩm, nguồn hàng..." /><Select value={source} onChange={setSource} options={[{ value: 'all', label: 'Nguồn bán' }, { value: 'Shopee', label: 'Shopee' }, { value: 'TikTok Shop', label: 'TikTok Shop' }]} /></div>
      <Table rowKey="key" dataSource={rows} pagination={false} size="small" scroll={{ x: 750 }} columns={[
        { title: 'Sản phẩm', dataIndex: 'name', render: (value: string) => <strong className="admin-product-name">{value}</strong> }, { title: 'Nguồn', dataIndex: 'source' },
        { title: 'Giá tham khảo', dataIndex: 'price' }, { title: 'Danh mục', dataIndex: 'category' }, { title: 'Trạng thái', dataIndex: 'status', render: (value: string) => <Status value={value} /> },
      ]} /></Panel></>;
}

function Sync() {
  const rows = [
    { key: '1', source: 'Shopee', action: 'Ảnh sản phẩm không tải được', impact: '12 sản phẩm', time: '14/10 · 12:21', level: 'Trung bình' },
    { key: '2', source: 'TikTok Shop', action: 'Giá bán thay đổi so với lần lưu', impact: '7 sản phẩm', time: '14/10 · 11:40', level: 'Thấp' },
    { key: '3', source: 'Shopee', action: 'Danh mục chưa được đồng bộ', impact: '4 sản phẩm', time: '14/10 · 09:15', level: 'Trung bình' },
  ];
  return <><div className="admin-two-col"><Panel title="Shopee" note="Lần cập nhật: 14/10 · 12:30" extra={<Status value="Hoạt động" />}><strong className="admin-source-count">8.420</strong><p>Sản phẩm đang đồng bộ</p><button className="admin-text-button" onClick={() => message.info('Chưa có API xem chi tiết đồng bộ.')}>Xem chi tiết →</button></Panel>
    <Panel title="TikTok Shop" note="Lần cập nhật: 14/10 · 12:26" extra={<Status value="Hoạt động" />}><strong className="admin-source-count">5.186</strong><p>Sản phẩm đang đồng bộ</p><button className="admin-text-button" onClick={() => message.info('Chưa có API xem chi tiết đồng bộ.')}>Xem chi tiết →</button></Panel></div>
    <Panel title="Sự cố đồng bộ cần xử lý" note="Theo dõi dữ liệu và khả năng kết nối từng nguồn" extra={<Status value="2 cảnh báo" />}><Table rowKey="key" dataSource={rows} pagination={false} size="small" scroll={{ x: 710 }} columns={[
      { title: 'Nguồn', dataIndex: 'source', render: (value: string) => <span className="admin-link-text">{value}</span> }, { title: 'Vấn đề', dataIndex: 'action' }, { title: 'Ảnh hưởng', dataIndex: 'impact' }, { title: 'Phát hiện', dataIndex: 'time' }, { title: 'Mức độ', dataIndex: 'level', render: (value: string) => <Status value={value} /> },
    ]} /><p className="admin-info-strip">Admin chỉ thấy thông tin cảnh báo mẫu; không thể tự chạy đồng bộ từ màn này.</p></Panel></>;
}

function Notifications() {
  const [filter, setFilter] = useState('Tất cả');
  const rows = [
    { key: '1', title: 'Gợi ý outfit cuối tuần', audience: 'Tất cả User', time: '14/10 · 10:30', status: 'Lên lịch' },
    { key: '2', title: 'Cập nhật tính năng tủ đồ', audience: 'Tất cả User', time: '14/10 · 08:00', status: 'Đã gửi' },
    { key: '3', title: 'Đơn hàng đã đồng bộ', audience: 'User có kết nối', time: '13/10 · 08:00', status: 'Đã gửi' },
    { key: '4', title: 'Bình chọn mới từ bạn bè', audience: 'User được mời', time: '11/10 · 18:00', status: 'Đã gửi' },
    { key: '5', title: 'Chào mừng thành viên mới', audience: 'User mới', time: 'Chưa đặt', status: 'Bản nháp' },
  ];
  return <><div className="admin-metrics admin-three-metrics"><Metric icon={<NotificationOutlined />} number="12" label="Đã gửi tháng này" note="Chiến dịch" /><Metric icon={<ClockCircleOutlined />} number="3" label="Đang lên lịch" note="Chờ thời điểm gửi" tone="amber" /><Metric icon={<TeamOutlined />} number="62,4%" label="Tỉ lệ mở" note="30 ngày gần đây" tone="green" /></div>
    <Panel title="Chiến dịch thông báo" note="Nội dung mẫu để duyệt giao diện" extra={<Button type="primary" disabled>Tạo thông báo</Button>}><div className="admin-filter-pills">{['Tất cả', 'Đã gửi', 'Lên lịch', 'Bản nháp'].map((value) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{value}</button>)}</div>
      <Table rowKey="key" dataSource={rows.filter((row) => filter === 'Tất cả' || row.status === filter)} pagination={false} size="small" scroll={{ x: 750 }} columns={[
        { title: 'Thông báo', dataIndex: 'title', render: (value: string) => <span className="admin-link-text">{value}</span> }, { title: 'Đối tượng', dataIndex: 'audience' }, { title: 'Lịch gửi', dataIndex: 'time' }, { title: 'Trạng thái', dataIndex: 'status', render: (value: string) => <Status value={value} /> },
      ]} /></Panel></>;
}

function Audit() {
  const [search, setSearch] = useState('');
  const rows = adminAudit.filter((row) => `${row.action} ${row.target} ${row.actor}`.toLowerCase().includes(search.toLowerCase()));
  return <Panel title="Lịch sử thao tác" note="Mọi thao tác quản trị tài khoản đều được lưu lại để đối chiếu."><div className="admin-toolbar"><Input prefix={<SearchOutlined />} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo hành động, tài khoản..." /></div>
    <Table rowKey="key" dataSource={rows} pagination={false} size="small" scroll={{ x: 750 }} columns={[
      { title: 'Thời gian', dataIndex: 'time' }, { title: 'Người thực hiện', dataIndex: 'actor' }, { title: 'Thao tác', dataIndex: 'action' }, { title: 'Người dùng', dataIndex: 'target' }, { title: 'Kết quả', dataIndex: 'result', render: (value: string) => <Status value={value} /> },
    ]} /></Panel>;
}

function Settings() {
  const groups = [
    { title: 'Quyền truy cập', note: 'Phân quyền theo vai trò Admin và các quyền thao tác.', rows: ['Xác thực hai bước', 'Phiên đăng nhập', 'Nhật ký thao tác'] },
    { title: 'Quy tắc nội dung', note: 'Thiết lập hàng đợi báo cáo từ cộng đồng.', rows: ['Nội dung bị báo cáo', 'Ưu tiên kiểm duyệt', 'Thông báo kết quả'] },
    { title: 'Đồng bộ và sản phẩm', note: 'Theo dõi kết nối và cập nhật dữ liệu từ cửa hàng.', rows: ['Shopee', 'TikTok Shop', 'Giá sản phẩm'] },
    { title: 'Thông báo hệ thống', note: 'Giữ liên lạc và gửi thông báo đến người dùng.', rows: ['Duyệt trước khi gửi', 'Khung giờ yên tĩnh', 'Báo lỗi gửi'] },
  ];
  return <div className="admin-settings-grid">{groups.map((group) => <Panel key={group.title} title={group.title} note={group.note}><div className="admin-fact-list">{group.rows.map((row) => <span key={row}>{row}<button className="admin-text-button" onClick={() => message.info('Chưa có API thay đổi cài đặt quản trị.')}>Chỉnh sửa ›</button></span>)}</div></Panel>)}</div>;
}

function Revenue() {
  const rows = [
    { key: '1', id: 'SUB-1048', plan: 'LOOKSY Plus', date: '14/10/2026', amount: '149.000đ', status: 'Thành công' },
    { key: '2', id: 'SUB-1047', plan: 'LOOKSY Premium', date: '14/10/2026', amount: '79.000đ', status: 'Thành công' },
    { key: '3', id: 'SUB-1046', plan: 'LOOKSY Plus', date: '13/10/2026', amount: '79.000đ', status: 'Chờ xử lý' },
  ];
  return <><div className="admin-metrics admin-three-metrics"><Metric icon={<DollarOutlined />} number="28.650.000đ" label="Doanh thu tháng" note="Tổng giao dịch" /><Metric icon={<BarChartOutlined />} number="386" label="Gói đang hoạt động" note="Plus và Premium" tone="green" /><Metric icon={<ClockCircleOutlined />} number="7" label="Giao dịch cần xử lý" note="Hoàn tiền / thất bại" tone="amber" /></div>
    <div className="admin-two-col"><Panel title="Xu hướng doanh thu gói" note="6 tháng gần đây · đơn vị: triệu đồng"><BarChart values={[34, 46, 43, 57, 66, 85]} labels={['T5', 'T6', 'T7', 'T8', 'T9', 'T10']} /></Panel><Panel title="Cơ cấu gói" note="Các gói đang hoạt động"><div className="admin-progress-label">LOOKSY Plus <strong>71%</strong></div><div className="admin-progress"><span style={{ width: '71%' }} /></div><div className="admin-progress-label">LOOKSY Premium <strong>29%</strong></div><div className="admin-progress pink"><span style={{ width: '29%' }} /></div></Panel></div>
    <Panel title="Giao dịch gần đây" note="Số liệu mẫu theo giao dịch gói"><Table rowKey="key" dataSource={rows} pagination={false} size="small" scroll={{ x: 730 }} columns={[
      { title: 'Mã giao dịch', dataIndex: 'id', render: (value: string) => <span className="admin-link-text">{value}</span> }, { title: 'Gói', dataIndex: 'plan' }, { title: 'Ngày', dataIndex: 'date' }, { title: 'Số tiền', dataIndex: 'amount' }, { title: 'Trạng thái', dataIndex: 'status', render: (value: string) => <Status value={value} /> },
    ]} /></Panel></>;
}

function Affiliate() {
  const rows = [
    { key: '1', source: 'Shopee', id: 'SH-1410-028', orders: 248, commission: '5.220.000đ', status: 'Đã đối soát' },
    { key: '2', source: 'TikTok Shop', id: 'TT-1410-164', orders: 164, commission: '3.200.000đ', status: 'Chờ đối soát' },
    { key: '3', source: 'Shopee', id: 'SH-1309-022', orders: 221, commission: '4.780.000đ', status: 'Đã thanh toán' },
  ];
  return <><div className="admin-metrics admin-three-metrics"><Metric icon={<TeamOutlined />} number="8.420.000đ" label="Hoa hồng phát sinh" note="Tháng 10/2026" /><Metric icon={<BarChartOutlined />} number="6.180.000đ" label="Đã đối soát" note="Có thể ghi nhận" tone="green" /><Metric icon={<CrownOutlined />} number="2.240.000đ" label="Chờ đối soát" note="Từ đơn mới" tone="amber" /></div>
    <div className="admin-two-col"><Panel title="Hiệu quả liên kết" note="Các số liệu tương tác từ liên kết tới cửa hàng"><div className="admin-mini-metrics"><div><strong>12.860</strong><small>Lượt nhấp</small></div><div><strong>412</strong><small>Đơn hợp lệ</small></div><div><strong>3,2%</strong><small>Tỷ lệ chuyển đổi</small></div></div></Panel><Panel title="Nguồn hoa hồng"><div className="admin-fact-list"><span>Shopee <strong>5.220.000đ</strong></span><span>TikTok Shop <strong>3.200.000đ</strong></span></div></Panel></div>
    <Panel title="Đối soát theo nguồn" note="Tổng hợp các đơn ghi nhận và hoa hồng theo kỳ đối soát"><Table rowKey="key" dataSource={rows} pagination={false} size="small" scroll={{ x: 730 }} columns={[
      { title: 'Nguồn', dataIndex: 'source', render: (value: string) => <span className="admin-link-text">{value}</span> }, { title: 'Kỳ đối soát', dataIndex: 'id' }, { title: 'Đơn hợp lệ', dataIndex: 'orders' }, { title: 'Hoa hồng', dataIndex: 'commission' }, { title: 'Trạng thái', dataIndex: 'status', render: (value: string) => <Status value={value} /> },
    ]} /></Panel></>;
}

export function AdminDashboardPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('view');
  const view: View = Object.hasOwn(titles, requested ?? '') ? requested as View : 'overview';
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const choose = (next: View) => { setSelectedUser(null); setParams(next === 'overview' ? {} : { view: next }); setMobileNav(false); };
  const content: Record<View, ReactNode> = {
    overview: <Overview openUser={(user) => { setSelectedUser(user); setParams({ view: 'users' }); }} />,
    users: selectedUser ? <UserDetail user={selectedUser} onBack={() => setSelectedUser(null)} /> : <Users openUser={setSelectedUser} />,
    content: <Content />, products: <Products />, sync: <Sync />, notifications: <Notifications />,
    audit: <Audit />, settings: <Settings />, revenue: <Revenue />, affiliate: <Affiliate />,
  };
  return <div className="admin-frame">
    <aside className={`admin-sidebar${mobileNav ? ' admin-sidebar-open' : ''}`}>
      <Link to="/" className="admin-brand"><Brand /></Link>
      <nav aria-label="Điều hướng quản trị">{nav.map((group) => <div className="admin-nav-group" key={group.heading}><span>{group.heading}</span>{group.items.map((item) => <button key={item.key} className={`admin-nav-item${view === item.key ? ' active' : ''}`} onClick={() => choose(item.key)}>{item.icon}{item.label}</button>)}</div>)}</nav>
      <Link to="/" className="admin-account"><Avatar>AD</Avatar><span><strong>Admin LOOKSY</strong><small>Quản trị viên</small></span></Link>
    </aside>
    <div className="admin-content"><header className="admin-topbar"><div className="admin-topbar-title"><Button className="admin-menu-button" icon={<MenuOutlined />} aria-label="Mở menu" onClick={() => setMobileNav((value) => !value)} /><span>Quản trị / {titles[view]}</span><strong>{selectedUser ? 'Chi tiết người dùng' : titles[view]}</strong></div><div className="admin-topbar-actions"><SearchOutlined /><BellOutlined /><Avatar>AD</Avatar></div></header>
      <main className="admin-page"><div className="admin-page-intro"><h1>{selectedUser ? 'Chi tiết người dùng' : titles[view]}</h1><p>{descriptions[view]}</p><span className="admin-demo-badge">Các bảng đang dùng dữ liệu minh họa · Chi phí AI lấy từ backend</span></div><div className="admin-view-content" key={`${view}-${selectedUser?.key ?? ''}`}>{content[view]}</div></main>
    </div>
  </div>;
}
