import {
  AppstoreOutlined, AuditOutlined, BarChartOutlined, BellOutlined, CloudSyncOutlined,
  HeartOutlined, LinkOutlined, LockOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  SettingOutlined, ShoppingOutlined, TeamOutlined, UserAddOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, Card, Input, Modal, Select, Skeleton, Table, Tag } from 'antd';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BackButton, Brand } from '../../../components/shared/ui/index';
import { AccountDrawer } from '../../../components/shared/layout/AccountDrawer';
import { SiteFooter } from '../../../components/shared/layout/SiteFooter';
import { errorMessage } from '../../../services/shared/api/client';
import { authRequests } from '../../../services/guest/auth/requests';
import { useAiUsage } from '../../../hooks/admin/dashboard/useAiUsage';
import { useAffiliateStats, useBillingStats, useUserStats } from '../../../hooks/admin/dashboard/useStats';
import { useAffiliateBlocks, useOrders, useRefund, useSystemStatus, useToggleBlock } from '../../../hooks/admin/dashboard/useAdminOps';
import type { OrderStatus } from '../../../services/admin/dashboard/requests';
import { listAdminUsers } from '../../../services/admin/dashboard/users';
import { management } from '../../../services/admin/management/requests';
import type { AdminUser } from '../../../interface/dto/admin/auth/AdminUsers';
import { AuditPanel, PermissionsPanel, ReportsPanel, RolesPanel, UserDetailDrawer } from './AdminManagementPanels';
import './admin-dashboard.css';

type View = 'overview' | 'users' | 'roles' | 'permissions' | 'content' | 'products' | 'sync' | 'notifications' | 'audit' | 'settings' | 'revenue' | 'affiliate';
const nav: { heading: string; items: { key: View; label: string; icon: ReactNode }[] }[] = [
  { heading: 'TỔNG QUAN', items: [{ key: 'overview', label: 'Tổng quan', icon: <AppstoreOutlined /> }] },
  { heading: 'QUẢN LÝ', items: [
    { key: 'users', label: 'Người dùng', icon: <TeamOutlined /> },
    { key: 'roles', label: 'Vai trò', icon: <LockOutlined /> },
    { key: 'permissions', label: 'Quyền hạn', icon: <LockOutlined /> },
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
const viewPermission: Partial<Record<View, string>> = {
  overview: 'USER_MANAGE', users: 'USER_MANAGE', roles: 'ROLE_MANAGE', permissions: 'ROLE_MANAGE',
  content: 'REPORT_MODERATE', audit: 'AUDIT_READ',
  revenue: 'BILLING_STATS_READ', affiliate: 'AFFILIATE_STATS_READ',
};

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

/** Biểu đồ cột theo ngày (date = yyyy-mm-dd từ backend, đã tính theo giờ Việt Nam). */
function DailyChart({ points, unit, format = (n: number) => n.toLocaleString('vi-VN') }: {
  points: { date: string; value: number }[]; unit: string; format?: (n: number) => string;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const label = (date: string) => { const [, m, d] = date.split('-'); return `${d}/${m}`; };
  if (!points.some((p) => p.value > 0)) return <div className="admin-empty">Chưa có {unit} trong khoảng này.</div>;
  return <div className="admin-chart-wrap"><div className="admin-chart" role="img" aria-label={points.map((p) => `${label(p.date)}: ${format(p.value)} ${unit}`).join(', ')}>
    {points.map((p) => <div className="admin-chart-column" key={p.date} title={`${label(p.date)}: ${format(p.value)} ${unit}`}><span style={{ height: `${p.value / max * 100}%` }} /><small>{label(p.date)}</small></div>)}
  </div></div>;
}

const vnd = (n: number) => `${n.toLocaleString('vi-VN')}đ`;

function RevenuePanel() {
  const stats = useBillingStats(30);
  const data = stats.data;
  return <div className="admin-overview">
    {stats.isError && <Card className="admin-panel"><p role="alert">Không tải được doanh thu: {errorMessage(stats.error)}</p></Card>}
    <div className="admin-metrics">
      <AdminMetric icon={<UserAddOutlined />} label="Đang dùng Plus" value={data?.plusSubscribers ?? null} note="Gói còn hạn" tone="admin-tone-green" />
      <AdminMetric icon={<TeamOutlined />} label="Đang dùng Pro" value={data?.proSubscribers ?? null} note="Gói còn hạn" tone="admin-tone-pink" />
      <AdminMetric icon={<BarChartOutlined />} label="Đơn đã thanh toán" value={data?.paidOrders ?? null} note="30 ngày qua" />
      <Card className="admin-metric admin-tone-amber"><span className="admin-metric-icon"><ShoppingOutlined /></span>
        <strong>{data ? vnd(data.revenueVnd) : '—'}</strong><span>Doanh thu gói</span><small>30 ngày qua</small></Card>
    </div>
    <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Doanh thu theo ngày</h2><p>Đơn PayOS đã thanh toán, 30 ngày qua</p></div></div>
      {stats.isPending ? <Skeleton active paragraph={{ rows: 5 }} /> : data && <DailyChart unit="doanh thu" format={vnd} points={data.daily.map((d) => ({ date: d.date, value: d.revenueVnd }))} />}
    </Card>
  </div>;
}

function AffiliatePanel() {
  const stats = useAffiliateStats(30);
  const data = stats.data;
  return <div className="admin-overview">
    {stats.isError && <Card className="admin-panel"><p role="alert">Không tải được số liệu affiliate: {errorMessage(stats.error)}</p></Card>}
    <div className="admin-metrics">
      <AdminMetric icon={<LinkOutlined />} label="Lượt bấm mua" value={data?.clicks ?? null} note="30 ngày qua" />
      <AdminMetric icon={<TeamOutlined />} label="Người đã bấm" value={data?.users ?? null} note="30 ngày qua" tone="admin-tone-green" />
    </div>
    <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Lượt bấm theo ngày</h2><p>Gợi ý mua thêm (TikTok Shop qua AccessTrade). Hoa hồng xem trên AccessTrade, đối chiếu theo sub1.</p></div></div>
      {stats.isPending ? <Skeleton active paragraph={{ rows: 5 }} /> : data && <DailyChart unit="lượt bấm" points={data.daily.map((d) => ({ date: d.date, value: d.clicks }))} />}
    </Card>
    <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Sản phẩm được bấm nhiều nhất</h2><p>30 ngày qua</p></div></div>
      <Table rowKey={(row) => `${row.source}-${row.productId}`} loading={stats.isPending} dataSource={data?.top ?? []} pagination={false} scroll={{ x: 650 }}
        columns={[{ title: 'Sản phẩm', dataIndex: 'title' }, { title: 'Sàn', dataIndex: 'source' }, { title: 'Lượt bấm', dataIndex: 'clicks' }]}
        locale={{ emptyText: 'Chưa có lượt bấm nào' }} />
    </Card>
  </div>;
}

const ORDER_STATUS: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: 'Chờ thanh toán', color: 'gold' },
  PAID: { label: 'Đã thanh toán', color: 'green' },
  CANCELLED: { label: 'Đã huỷ', color: 'default' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'purple' },
};
const dateTime = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('vi-VN') : '—');

/** Đơn thanh toán: lọc theo trạng thái, tìm theo mã đơn hoặc email; hoàn tiền đơn đã thanh toán. */
function OrdersPanel() {
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<{ ownerId?: string; orderCode?: number }>({});
  const [searchError, setSearchError] = useState('');
  const [page, setPage] = useState(0);
  const [target, setTarget] = useState<{ orderCode: number; amountVnd: number } | null>(null);
  const [reason, setReason] = useState('');
  const orders = useOrders({ status, ...filter, page, size: 10 });
  const refund = useRefund();

  const applySearch = async () => {
    const q = search.trim();
    setSearchError('');
    setPage(0);
    if (!q) return setFilter({});
    if (/^\d+$/.test(q)) return setFilter({ orderCode: Number(q) });
    // Billing không biết email: tìm người dùng ở auth-service rồi lọc theo id
    const found = await listAdminUsers(0, q, 1).catch(() => null);
    const user = found?.items[0];
    if (!user) return setSearchError(`Không tìm thấy người dùng "${q}"`);
    setFilter({ ownerId: user.id });
  };

  const confirmRefund = () => target && refund.mutate({ orderCode: target.orderCode, reason: reason.trim() }, {
    onSuccess: () => { setTarget(null); setReason(''); },
  });

  return <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Đơn thanh toán</h2><p>Mới nhất trước. Tìm theo mã đơn hoặc email người mua.</p></div></div>
    <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
      <Select allowClear placeholder="Mọi trạng thái" style={{ minWidth: 180 }} value={status} onChange={(v) => { setStatus(v); setPage(0); }}
        options={(Object.keys(ORDER_STATUS) as OrderStatus[]).map((k) => ({ value: k, label: ORDER_STATUS[k].label }))} />
      <Input.Search allowClear placeholder="Mã đơn hoặc email" style={{ maxWidth: 320 }} value={search}
        onChange={(e) => setSearch(e.target.value)} onSearch={() => void applySearch()} />
    </div>
    {searchError && <p role="alert">{searchError}</p>}
    {orders.isError && <p role="alert">{errorMessage(orders.error)}</p>}
    {refund.isSuccess && <p className="small">Đã hoàn tiền đơn #{refund.data.order.orderCode}. {refund.data.newExpiry
      ? `Gói của người dùng còn tới ${dateTime(refund.data.newExpiry)}.`
      : 'Người dùng đã đổi gói sau đơn này: kiểm tra và chỉnh gói tay nếu cần.'}</p>}
    <Table rowKey="orderCode" loading={orders.isPending} dataSource={orders.data?.items ?? []} scroll={{ x: 900 }}
      pagination={{ current: page + 1, pageSize: 10, total: orders.data?.total ?? 0, onChange: (next) => setPage(next - 1) }}
      locale={{ emptyText: 'Chưa có đơn nào' }}
      columns={[
        { title: 'Mã đơn', dataIndex: 'orderCode' },
        { title: 'Gói', render: (_, o) => `${o.plan === 'PRO' ? 'Pro' : 'Plus'} · ${o.period === 'YEARLY' ? 'năm' : 'tháng'}` },
        { title: 'Số tiền', dataIndex: 'amountVnd', render: (v: number) => vnd(v) },
        { title: 'Trạng thái', dataIndex: 'status', render: (v: OrderStatus, o) => <Tag color={ORDER_STATUS[v].color} title={o.refundReason ?? undefined}>{ORDER_STATUS[v].label}</Tag> },
        { title: 'Tạo lúc', dataIndex: 'createdAt', render: dateTime },
        { title: 'Thanh toán lúc', dataIndex: 'paidAt', render: dateTime },
        { title: '', render: (_, o) => o.status === 'PAID'
          ? <Button size="small" danger onClick={() => { refund.reset(); setTarget({ orderCode: o.orderCode, amountVnd: o.amountVnd }); }}>Hoàn tiền</Button>
          : o.status === 'REFUNDED' ? <small className="muted">{o.refundReason}</small> : null },
      ]} />
    <Modal open={!!target} title={`Hoàn tiền đơn #${target?.orderCode ?? ''}`} okText="Xác nhận đã hoàn tiền" okButtonProps={{ danger: true, disabled: !reason.trim(), loading: refund.isPending }}
      cancelText="Huỷ" onOk={confirmRefund} onCancel={() => { setTarget(null); setReason(''); }}>
      <p>Chuyển trả {target ? vnd(target.amountVnd) : ''} cho người mua trước (bằng app ngân hàng), rồi mới xác nhận ở đây.
        Thời gian gói của đơn này sẽ bị trừ lại; hết thời gian thì người dùng về gói Free.</p>
      <Input.TextArea rows={3} maxLength={300} placeholder="Lý do (vd: chuyển khoản trùng, gói không kích hoạt)" value={reason} onChange={(e) => setReason(e.target.value)} />
      {refund.isError && <p role="alert">{errorMessage(refund.error)}</p>}
    </Modal>
  </Card>;
}

/** Sản phẩm affiliate: chặn món xấu (hàng giả, shop kém) khỏi Gợi ý mua thêm. */
function ProductsPanel() {
  const stats = useAffiliateStats(30);
  const blocks = useAffiliateBlocks();
  const toggle = useToggleBlock();
  const blockedKeys = new Set((blocks.data ?? []).map((b) => `${b.source}:${b.productId}`));
  return <div className="admin-overview">
    {(blocks.isError || toggle.isError) && <Card className="admin-panel"><p role="alert">{errorMessage(blocks.error ?? toggle.error)}</p></Card>}
    <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Được bấm nhiều nhất</h2><p>30 ngày qua. Chặn thì sản phẩm không còn xuất hiện trong Gợi ý mua thêm.</p></div></div>
      <Table rowKey={(row) => `${row.source}-${row.productId}`} loading={stats.isPending} dataSource={stats.data?.top ?? []} pagination={false} scroll={{ x: 650 }}
        locale={{ emptyText: 'Chưa có lượt bấm nào' }}
        columns={[{ title: 'Sản phẩm', dataIndex: 'title' }, { title: 'Sàn', dataIndex: 'source' }, { title: 'Lượt bấm', dataIndex: 'clicks' },
          { title: '', render: (_, row) => {
            const blocked = blockedKeys.has(`${row.source}:${row.productId}`);
            return <Button size="small" danger={!blocked} loading={toggle.isPending && toggle.variables?.productId === row.productId}
              onClick={() => toggle.mutate({ source: row.source, productId: row.productId, title: row.title, blocked })}>{blocked ? 'Bỏ chặn' : 'Chặn'}</Button>;
          } }]} />
    </Card>
    <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Đã chặn</h2><p>{blocks.data ? `${blocks.data.length} sản phẩm` : 'Đang tải…'}</p></div></div>
      <Table rowKey={(row) => `${row.source}-${row.productId}`} loading={blocks.isPending} dataSource={blocks.data ?? []} pagination={false} scroll={{ x: 650 }}
        locale={{ emptyText: 'Chưa chặn sản phẩm nào' }}
        columns={[{ title: 'Sản phẩm', dataIndex: 'title', render: (t: string, row) => t || row.productId }, { title: 'Sàn', dataIndex: 'source' },
          { title: 'Chặn lúc', dataIndex: 'blockedAt', render: dateTime },
          { title: '', render: (_, row) => <Button size="small" onClick={() => toggle.mutate({ ...row, blocked: true })}>Bỏ chặn</Button> }]} />
    </Card>
  </div>;
}

/** Trạng thái hệ thống: dịch vụ ngoài đã cấu hình đủ chưa. Chỉ biết có / không có key, không xem được key. */
function SystemStatusPanel() {
  const { billing, outfit, wardrobe } = useSystemStatus();
  const b = billing.data, o = outfit.data, w = wardrobe.data;
  const rows: { name: string; ok: boolean | null; detail: string }[] = [
    { name: 'Thanh toán PayOS', ok: b ? b.paymentGateway === 'payos' && b.payosConfigured : null,
      detail: !b ? 'billing-service chưa trả lời' : b.payosConfigured ? 'Đã có key, bán gói được' : 'Thiếu key PayOS: bấm mua gói sẽ báo lỗi 503' },
    { name: 'AI gợi ý outfit (Gemini)', ok: o ? o.geminiConfigured || o.anthropicConfigured : null,
      detail: !o ? 'outfit-service chưa trả lời' : `Chế độ ${o.aiProvider}; Gemini ${o.geminiConfigured ? 'có' : 'chưa có'} key, Claude dự phòng ${o.anthropicConfigured ? 'có' : 'chưa có'} key` },
    { name: 'AI nhận diện quần áo', ok: w ? w.geminiConfigured || w.anthropicConfigured : null,
      detail: !w ? 'wardrobe-service chưa trả lời' : `Chế độ ${w.aiProvider}; Gemini ${w.geminiConfigured ? 'có' : 'chưa có'} key, Claude ${w.anthropicConfigured ? 'có' : 'chưa có'} key` },
    { name: 'Lưu ảnh tủ đồ', ok: w ? w.imageStorage === 'cloudinary' && w.cloudinaryConfigured : null,
      detail: !w ? 'wardrobe-service chưa trả lời' : w.imageStorage === 'cloudinary' ? 'Cloudinary' : 'Ổ đĩa máy chủ: ảnh mất mỗi lần service khởi động lại, cần bật Cloudinary' },
    { name: 'Affiliate (AccessTrade)', ok: o ? o.accessTradeConfigured : null,
      detail: !o ? 'outfit-service chưa trả lời' : o.accessTradeConfigured ? 'Đã có key, Gợi ý mua thêm đang chạy' : 'Thiếu ACCESSTRADE_API_KEY: Gợi ý mua thêm đang tắt' },
  ];
  return <div className="admin-overview">
    <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Dịch vụ bên ngoài</h2><p>Chỉ cho biết đã có key hay chưa; key được đặt trên Render, không hiện ở đây.</p></div></div>
      <Table rowKey="name" dataSource={rows} pagination={false} scroll={{ x: 650 }}
        columns={[{ title: 'Dịch vụ', dataIndex: 'name' },
          { title: 'Trạng thái', dataIndex: 'ok', render: (ok: boolean | null) => ok === null ? <Tag>Không rõ</Tag> : <Tag color={ok ? 'green' : 'red'}>{ok ? 'Sẵn sàng' : 'Cần cấu hình'}</Tag> },
          { title: 'Chi tiết', dataIndex: 'detail' }]} />
    </Card>
    <AiUsagePanel />
  </div>;
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
  const activePercent = sample.length ? Math.round(active / sample.length * 100) : null;
  const sampleNote = page ? `Trong ${sample.length} tài khoản gần nhất` : 'Chờ dữ liệu từ auth-service';
  const stats = useUserStats(14);
  const activeToday = stats.data?.activeUsers.at(-1)?.count ?? null;

  return <div className="admin-overview">
    {users.isError && <Card className="admin-panel"><p role="alert">Không tải được dữ liệu người dùng: {errorMessage(users.error)}</p></Card>}
    {users.isPending ? <div className="admin-metrics">{Array.from({ length: 4 }, (_, index) => <Card key={index} className="admin-metric"><Skeleton active paragraph={{ rows: 2 }} title={false} /></Card>)}</div> : <div className="admin-metrics">
      <AdminMetric icon={<TeamOutlined />} label="Tổng người dùng" value={stats.data?.totalUsers ?? page?.total ?? null} note="Toàn hệ thống" />
      <AdminMetric icon={<UserAddOutlined />} label="Mới trong 7 ngày" value={stats.data?.newLast7Days ?? (page ? newThisWeek : null)} note={stats.data ? 'Toàn hệ thống' : sampleNote} tone="admin-tone-pink" />
      <AdminMetric icon={<AppstoreOutlined />} label="Mở app trong 7 ngày" value={stats.data?.activeLast7Days ?? null} note="Người dùng hoạt động (WAU)" tone="admin-tone-green" />
      <AdminMetric icon={<LockOutlined />} label="Mở app hôm nay" value={activeToday} note={`DAU · ${locked} tài khoản tạm khóa`} tone="admin-tone-amber" />
    </div>}

    <div className="admin-two-col">
      <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Người dùng mới</h2><p>Tài khoản đăng ký mỗi ngày, 14 ngày qua</p></div></div>
        {stats.isError && <p role="alert">{errorMessage(stats.error)}</p>}
        {stats.isPending ? <Skeleton active paragraph={{ rows: 5 }} /> : stats.data && <DailyChart unit="người đăng ký" points={stats.data.newUsers.map((d) => ({ date: d.date, value: d.count }))} />}
      </Card>
      <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Người dùng hoạt động</h2><p>Số người mở app mỗi ngày (DAU), 14 ngày qua</p></div></div>
        {stats.isPending ? <Skeleton active paragraph={{ rows: 5 }} /> : stats.data && <DailyChart unit="người dùng" points={stats.data.activeUsers.map((d) => ({ date: d.date, value: d.count }))} />}
      </Card>
    </div>

    <div className="admin-two-col">
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
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ['me'], queryFn: authRequests.me });
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const users = useQuery({ queryKey: ['admin', 'users', page, query], queryFn: () => listAdminUsers(page, query) });
  const changeStatus = useMutation({ mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'LOCKED' }) => management.status(id, status),
    onSuccess: async () => { setActionError(''); await qc.invalidateQueries({ queryKey: ['admin', 'users'] }); },
    onError: (error) => setActionError(errorMessage(error)) });
  return <><Card className="admin-panel"><div className="admin-panel-heading"><div><h2>Danh sách người dùng</h2><p>{users.data ? `${users.data.total} tài khoản trong hệ thống` : 'Dữ liệu từ auth-service'}</p></div></div>
    <form className="admin-toolbar" onSubmit={(event) => { event.preventDefault(); setPage(0); setQuery(search.trim()); }}><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên hoặc email" aria-label="Tìm người dùng" /><Button htmlType="submit">Tìm</Button></form>
    {users.isError && <p role="alert">{errorMessage(users.error)}</p>}
    {actionError && <p role="alert">{actionError}</p>}
    <Table<AdminUser> rowKey="id" loading={users.isPending} dataSource={users.data?.items ?? []} scroll={{ x: 760 }}
      pagination={{ current: page + 1, pageSize: users.data?.size ?? 10, total: users.data?.total ?? 0, onChange: (next) => setPage(next - 1) }}
      columns={[
        { title: 'Người dùng', dataIndex: 'username' }, { title: 'Email', dataIndex: 'email' },
        { title: 'Ngày tham gia', dataIndex: 'createdAt', render: (value: string) => new Date(value).toLocaleDateString('vi-VN') },
        { title: 'Xác minh', dataIndex: 'emailVerified', render: (verified: boolean) => verified ? 'Đã xác minh' : 'Chưa xác minh' },
        { title: 'Trạng thái', dataIndex: 'status', render: (status: string) => <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}</Tag> },
        { title: 'Thao tác', render: (_: unknown, row: AdminUser) => <><Button onClick={() => setSelectedId(row.id)}>Chi tiết</Button>{' '}
          <Button size="small" danger={row.status === 'ACTIVE'} disabled={row.id === me.data?.id || changeStatus.isPending}
            onClick={() => { const next = row.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
              if (window.confirm(`${next === 'LOCKED' ? 'Khóa' : 'Mở'} tài khoản ${row.email}?`))
                changeStatus.mutate({ id: row.id, status: next }); }}>
            {row.status === 'ACTIVE' ? 'Khóa' : 'Mở'}</Button></> },
      ]} />
  </Card><UserDetailDrawer id={selectedId} onClose={() => setSelectedId(null)} /></>;
}

export function AdminDashboardPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('view');
  const view: View = requested && Object.hasOwn(titles, requested) ? requested as View : 'overview';
  const [mobileNav, setMobileNav] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const me = useQuery({ queryKey: ['me'], queryFn: authRequests.me });
  const allowed = !viewPermission[view] || me.data?.permissions?.includes(viewPermission[view]);
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
    <aside id="admin-sidebar" className={`admin-sidebar${mobileNav ? ' admin-sidebar-open' : ''}`} aria-hidden={collapsed && !mobileNav} ref={(node) => { node?.toggleAttribute('inert', collapsed && !mobileNav); }}>
      <div className="admin-brand-row"><Link to="/" className="admin-brand" aria-label="The Looks, về trang chủ"><Brand /><strong>The Looks</strong></Link><button className="admin-sidebar-close" type="button" aria-label="Đóng menu" onClick={() => setMobileNav(false)}><MenuFoldOutlined /></button></div>
      <nav aria-label="Điều hướng quản trị">{nav.map((group) => <div className="admin-nav-group" key={group.heading}><span className="admin-nav-heading">{group.heading}</span>{group.items.map((item) => <button key={item.key} type="button" title={item.label} aria-current={view === item.key ? 'page' : undefined} className={`admin-nav-item${view === item.key ? ' active' : ''}`} onClick={() => choose(item.key)}>{item.icon}<span className="admin-nav-label">{item.label}</span></button>)}</div>)}</nav>
    </aside>
    <div className="admin-content"><header className="admin-topbar"><div className="admin-topbar-left">
      <button className="admin-collapse-button" type="button" aria-label={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'} aria-controls="admin-sidebar" aria-expanded={!collapsed} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}</button>
      <button className="admin-menu-button" type="button" aria-label="Mở menu" aria-controls="admin-sidebar" aria-expanded={mobileNav} onClick={() => setMobileNav((value) => !value)}><MenuUnfoldOutlined /></button>
      <div className="admin-topbar-title"><span>Quản trị / {titles[view]}</span><BackButton /></div>
    </div><div className="admin-topbar-actions">
      <button type="button" className="admin-notification-button" aria-label="Xem thông báo quản trị" onClick={() => choose('notifications')}><BellOutlined /></button>
      <button type="button" className="topbar-avatar-trigger admin-avatar-trigger" aria-label="Mở menu tài khoản" aria-controls="account-drawer" aria-expanded={accountOpen} onClick={() => setAccountOpen(true)}><Avatar className="user-avatar">{avatarLetter}</Avatar></button>
    </div></header>
      <main className="admin-page"><div className="admin-page-intro"><h1>{titles[view]}</h1><p>{view === 'overview' ? 'Số liệu được lấy trực tiếp từ các service.' : 'Thông tin quản trị từ hệ thống.'}</p></div>
        <div className="admin-view-content" key={view}>
          {!allowed && <Card className="admin-panel"><p role="alert">Tài khoản chưa có quyền xem mục này.</p></Card>}
          {allowed && view === 'overview' && <OverviewPanel onOpenUsers={() => choose('users')} />}
          {allowed && view === 'users' && <UsersPanel />}
          {allowed && view === 'roles' && <RolesPanel />}
          {allowed && view === 'permissions' && <PermissionsPanel />}
          {allowed && view === 'content' && <ReportsPanel />}
          {allowed && view === 'audit' && <AuditPanel />}
          {allowed && view === 'revenue' && <><RevenuePanel /><OrdersPanel /></>}
          {allowed && view === 'affiliate' && <AffiliatePanel />}
          {allowed && view === 'products' && <ProductsPanel />}
          {allowed && view === 'settings' && <SystemStatusPanel />}
          {allowed && !['overview', 'users', 'roles', 'permissions', 'content', 'audit', 'revenue', 'affiliate', 'products', 'settings'].includes(view) && <Card className="admin-panel"><div className="admin-panel-heading"><div><h2>{titles[view]}</h2><p>Chưa có API quản trị cho mục này.</p></div></div><p className="muted">Mục này sẽ hiển thị khi backend cung cấp dữ liệu thật. Hiện chưa có thống kê để hiển thị.</p></Card>}
        </div>
      </main>
      <SiteFooter variant="admin" />
    </div>
    <AccountDrawer open={accountOpen} onClose={() => setAccountOpen(false)} account={me.data} isAdmin />
  </div>;
}
