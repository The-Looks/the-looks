import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Descriptions, Drawer, Input, Modal, Select, Space, Table, Tag, Typography } from 'antd';
import { useState } from 'react';
import { authRequests } from '../../../services/guest/auth/requests';
import { errorMessage } from '../../../services/shared/api/client';
import { management, type AdminPermission, type AdminRole, type PollReport } from '../../../services/admin/management/requests';

const dateTime = (value: string) => new Date(value).toLocaleString('vi-VN');

export function UserDetailDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [actionError, setActionError] = useState('');
  const me = useQuery({ queryKey: ['me'], queryFn: authRequests.me });
  const user = useQuery({ queryKey: ['admin', 'user', id], queryFn: () => management.user(id!), enabled: !!id });
  const canManageRoles = !!me.data?.permissions?.includes('ROLE_MANAGE');
  const canDelete = !!me.data?.permissions?.includes('USER_DELETE');
  const roles = useQuery({ queryKey: ['admin', 'roles'], queryFn: management.roles, enabled: !!id && canManageRoles });
  const wardrobe = useQuery({ queryKey: ['admin', 'wardrobe', id], queryFn: () => management.wardrobe(id!), enabled: !!id });
  const outfit = useQuery({ queryKey: ['admin', 'outfit', id], queryFn: () => management.outfit(id!), enabled: !!id });
  const billing = useQuery({ queryKey: ['admin', 'billing', id], queryFn: () => management.billing(id!), enabled: !!id });
  const polls = useQuery({ queryKey: ['admin', 'polls', id], queryFn: () => management.polls(id!), enabled: !!id });
  const deletion = useQuery({ queryKey: ['admin', 'deletion', id], queryFn: () => management.deletion(id!),
    enabled: !!id && canDelete, retry: false,
    refetchInterval: (query) => query.state.data?.status === 'DONE' ? false : 5000 });
  const busy = useMutation({ mutationFn: async (fn: () => Promise<unknown>) => fn(), onSuccess: async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['admin', 'user', id] }),
      qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
      qc.invalidateQueries({ queryKey: ['admin', 'deletion', id] }),
    ]);
  }, onError: (e) => setActionError(errorMessage(e)) });
  const run = (fn: () => Promise<unknown>) => { setActionError(''); busy.mutate(fn); };
  const target = user.data;
  const self = !!target && target.id === me.data?.id;
  const deletingNow = deletion.data?.status === 'RUNNING'
    && Date.now() - new Date(deletion.data.updatedAt).getTime() < 5 * 60 * 1000;
  return <Drawer title="Chi tiết người dùng" open={!!id} onClose={onClose} width={560} destroyOnClose>
    {user.isPending && <p>Đang tải tài khoản…</p>}
    {deletion.data?.status === 'DONE' && <Alert type="success" message="Đã xóa tài khoản và dữ liệu liên quan." />}
    {user.isError && <Alert type="error" message={errorMessage(user.error)} />}
    {target && <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {actionError && <Alert type="error" showIcon message={actionError} />}
      <Descriptions column={1} bordered size="small" title={target.username}>
        <Descriptions.Item label="Email">{target.email}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái"><Tag color={target.status === 'ACTIVE' ? 'green' : 'red'}>{target.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="Ngày tham gia">{dateTime(target.createdAt)}</Descriptions.Item>
        <Descriptions.Item label="Xác minh">{target.emailVerified ? 'Đã xác minh' : 'Chưa xác minh'}</Descriptions.Item>
        <Descriptions.Item label="Gói">{billing.isError ? 'Không tải được' : billing.data?.plan ?? 'Đang tải…'}</Descriptions.Item>
        <Descriptions.Item label="Món tủ đồ">{wardrobe.isError ? 'Không tải được' : wardrobe.data?.itemCount ?? 'Đang tải…'}</Descriptions.Item>
        <Descriptions.Item label="Outfit đã lưu">{outfit.isError ? 'Không tải được' : outfit.data?.savedOutfitCount ?? 'Đang tải…'}</Descriptions.Item>
        <Descriptions.Item label="Bình chọn">{polls.isError ? 'Không tải được' : polls.data?.pollCount ?? 'Đang tải…'}</Descriptions.Item>
        <Descriptions.Item label="Quyền hiệu lực">{target.permissions.join(', ') || '—'}</Descriptions.Item>
      </Descriptions>
      <Card size="small" title="Trạng thái tài khoản">
        <Button disabled={self || busy.isPending} danger={target.status === 'ACTIVE'} onClick={() => {
          const next = target.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
          if (window.confirm(`${next === 'LOCKED' ? 'Khóa' : 'Mở'} tài khoản ${target.email}?`)) run(() => management.status(target.id, next));
        }}>{target.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở tài khoản'}</Button>
        {self && <Typography.Text type="secondary"> Không thể tự thay đổi tài khoản quản trị.</Typography.Text>}
      </Card>
      {canManageRoles && <Card size="small" title="Vai trò">
        <Space direction="vertical">{roles.data?.map((role) => {
          const assigned = target.roles.includes(role.code);
          return <Space key={role.code}><Tag>{role.code}</Tag><Button size="small" disabled={self || busy.isPending || (assigned && role.code === 'USER')}
            onClick={() => run(() => assigned ? management.revokeRole(target.id, role.code) : management.grantRole(target.id, role.code))}>
            {assigned ? 'Gỡ' : 'Cấp'}
          </Button></Space>;
        })}</Space>
      </Card>}
      {canDelete && <Card size="small" title="Xóa tài khoản theo yêu cầu">
        {deletion.data && <p>Trạng thái: <strong>{deletion.data.status}</strong> · Bước: {deletion.data.step}{deletion.data.lastError ? ` · ${deletion.data.lastError}` : ''}</p>}
        <Button danger loading={busy.isPending} disabled={self || deletingNow || deletion.data?.status === 'DONE'} onClick={() => {
          if (window.confirm(`Xóa vĩnh viễn dữ liệu của ${target.email} ở mọi service? Thao tác này không thể hoàn tác.`))
            run(() => management.startDeletion(target.id));
        }}>{deletingNow ? 'Đang xóa dữ liệu' : deletion.data?.status === 'FAILED' || deletion.data?.status === 'RUNNING'
          ? 'Thử lại bước lỗi' : 'Xóa tài khoản'}</Button>
      </Card>}
    </Space>}
  </Drawer>;
}

export function RolesPanel() {
  const qc = useQueryClient();
  const roles = useQuery({ queryKey: ['admin', 'roles'], queryFn: management.roles });
  const permissions = useQuery({ queryKey: ['admin', 'permissions'], queryFn: management.permissions });
  const [editing, setEditing] = useState<AdminRole | null>(null);
  const [newCode, setNewCode] = useState('');
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const mutation = useMutation({ mutationFn: async (fn: () => Promise<unknown>) => fn(), onSuccess: async () => {
    setEditing(null); setNewCode(''); setName(''); setError('');
    await qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
  }, onError: (e) => setError(errorMessage(e)) });
  const open = (role?: AdminRole) => { setEditing(role ?? { code: '', name: '', permissions: [], system: false }); setNewCode(role?.code ?? ''); setName(role?.name ?? ''); setSelected(role?.permissions ?? []); setError(''); };
  const save = () => mutation.mutate(async () => {
    if (editing?.code) {
      await management.updateRole(editing.code, name);
      await management.rolePermissions(editing.code, selected);
    } else {
      await management.createRole(newCode.trim().toUpperCase(), name);
      if (selected.length) await management.rolePermissions(newCode.trim().toUpperCase(), selected);
    }
  });
  return <Card className="admin-panel" title="Vai trò" extra={<Button type="primary" onClick={() => open()}>Thêm vai trò</Button>}>
    {roles.isError && <Alert type="error" message={errorMessage(roles.error)} />}
    <Table<AdminRole> rowKey="code" loading={roles.isPending} dataSource={roles.data ?? []} pagination={false}
      columns={[{ title: 'Mã', dataIndex: 'code' }, { title: 'Tên', dataIndex: 'name' },
        { title: 'Quyền', render: (_, role) => role.permissions.join(', ') || '—' },
        { title: '', render: (_, role) => <Space><Button onClick={() => open(role)}>Sửa</Button>
          <Button danger disabled={role.system} onClick={() => {
            if (window.confirm(`Xóa vai trò ${role.code}?`)) mutation.mutate(() => management.deleteRole(role.code));
          }}>Xóa</Button></Space> }]}/>
    <Modal title={editing?.code ? `Sửa ${editing.code}` : 'Thêm vai trò'} open={!!editing} onCancel={() => setEditing(null)} onOk={save} okButtonProps={{ loading: mutation.isPending }}>
      {error && <Alert type="error" message={error} style={{ marginBottom: 12 }} />}
      <Input placeholder="Mã vai trò, ví dụ MODERATOR" value={newCode} disabled={!!editing?.code} onChange={(e) => setNewCode(e.target.value.toUpperCase())} style={{ marginBottom: 12 }} />
      <Input placeholder="Tên vai trò" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 12 }} />
      <Select mode="multiple" style={{ width: '100%' }} placeholder="Chọn quyền" value={selected} onChange={setSelected}
        options={permissions.data?.map((permission) => ({ label: `${permission.code} · ${permission.description}`, value: permission.code }))} />
    </Modal>
  </Card>;
}

export function PermissionsPanel() {
  const qc = useQueryClient();
  const permissions = useQuery({ queryKey: ['admin', 'permissions'], queryFn: management.permissions });
  const [editing, setEditing] = useState<AdminPermission | null>(null);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const mutation = useMutation({ mutationFn: async (fn: () => Promise<unknown>) => fn(), onSuccess: async () => {
    setEditing(null); setError(''); await qc.invalidateQueries({ queryKey: ['admin', 'permissions'] });
  }, onError: (e) => setError(errorMessage(e)) });
  const open = (permission?: AdminPermission) => { setEditing(permission ?? { code: '', description: '', system: false }); setCode(permission?.code ?? ''); setDescription(permission?.description ?? ''); setError(''); };
  return <Card className="admin-panel" title="Quyền hạn" extra={<Button type="primary" onClick={() => open()}>Thêm quyền</Button>}>
    <p className="muted">Mã quyền mới cần được gắn với chức năng trong backend để có hiệu lực.</p>
    {permissions.isError && <Alert type="error" message={errorMessage(permissions.error)} />}
    <Table<AdminPermission> rowKey="code" loading={permissions.isPending} dataSource={permissions.data ?? []} pagination={false}
      columns={[{ title: 'Mã', dataIndex: 'code' }, { title: 'Mô tả', dataIndex: 'description' },
        { title: '', render: (_, permission) => <Space><Button onClick={() => open(permission)}>Sửa</Button>
          <Button danger disabled={permission.system} onClick={() => {
            if (window.confirm(`Xóa quyền ${permission.code}?`)) mutation.mutate(() => management.deletePermission(permission.code));
          }}>Xóa</Button></Space> }]}/>
    <Modal title={editing?.code ? `Sửa ${editing.code}` : 'Thêm quyền'} open={!!editing} onCancel={() => setEditing(null)}
      onOk={() => mutation.mutate(() => editing?.code ? management.updatePermission(editing.code, description) : management.createPermission(code.trim().toUpperCase(), description))}
      okButtonProps={{ loading: mutation.isPending }}>
      {error && <Alert type="error" message={error} style={{ marginBottom: 12 }} />}
      <Input placeholder="Mã quyền" value={code} disabled={!!editing?.code} onChange={(e) => setCode(e.target.value.toUpperCase())} style={{ marginBottom: 12 }} />
      <Input.TextArea placeholder="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
    </Modal>
  </Card>;
}

export function ReportsPanel() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<'OPEN' | 'IGNORED' | 'HIDDEN' | 'ALL'>('OPEN');
  const [error, setError] = useState('');
  const reports = useQuery({ queryKey: ['admin', 'reports', status], queryFn: () => management.reports(status) });
  const mutation = useMutation({ mutationFn: ({ id, action }: { id: string; action: 'IGNORED' | 'HIDDEN' }) => management.decideReport(id, action),
    onSuccess: async () => { setError(''); await qc.invalidateQueries({ queryKey: ['admin', 'reports'] }); }, onError: (e) => setError(errorMessage(e)) });
  return <Card className="admin-panel" title="Báo cáo bình chọn" extra={<Select value={status} onChange={setStatus} options={['OPEN', 'IGNORED', 'HIDDEN', 'ALL'].map((v) => ({ label: v, value: v }))} />}>
    {error && <Alert type="error" message={error} />}
    {reports.isError && <Alert type="error" message={errorMessage(reports.error)} />}
    <Table<PollReport> rowKey="id" loading={reports.isPending} dataSource={reports.data ?? []} scroll={{ x: 720 }}
      columns={[{ title: 'Bình chọn', render: (_, report) => <a href={`/v/${report.pollCode}`} target="_blank" rel="noreferrer">{report.question || report.pollCode}</a> },
        { title: 'Lý do', dataIndex: 'reason' }, { title: 'Ngày', dataIndex: 'createdAt', render: dateTime },
        { title: 'Trạng thái', dataIndex: 'status' }, { title: '', render: (_, report) => report.status === 'OPEN' && <Space>
          <Button danger onClick={() => mutation.mutate({ id: report.id, action: 'HIDDEN' })}>Ẩn</Button>
          <Button onClick={() => mutation.mutate({ id: report.id, action: 'IGNORED' })}>Bỏ qua</Button></Space> }]}/>
  </Card>;
}

export function AuditPanel() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [outcome, setOutcome] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');
  const auth = useQuery({ queryKey: ['admin', 'audit', query, outcome], queryFn: () => management.audit(query, outcome) });
  const voting = useQuery({ queryKey: ['admin', 'moderation-audit'], queryFn: management.moderationAudit });
  const rows = [...(auth.data ?? []).map((a) => ({ id: a.id, actorId: a.actorId, target: a.targetId ?? '—', action: a.action, detail: a.detail ?? '', outcome: a.outcome, createdAt: a.createdAt })),
    ...(voting.data ?? []).map((a) => ({ id: a.id, actorId: a.actorId, target: a.pollCode, action: `POLL_${a.action}`, detail: '', outcome: a.outcome, createdAt: a.createdAt }))]
    .filter((a) => !query || [a.actorId, a.target, a.action, a.detail].some((v) => v.toLowerCase().includes(query.toLowerCase())))
    .filter((a) => outcome === 'ALL' || a.outcome === outcome)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <Card className="admin-panel" title="Nhật ký thao tác">
    <Space style={{ marginBottom: 16 }}><Input placeholder="Tìm hành động hoặc đối tượng" value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={() => setQuery(search.trim())} /><Button onClick={() => setQuery(search.trim())}>Tìm</Button>
      <Select aria-label="Lọc kết quả" value={outcome} onChange={setOutcome} options={[{ value: 'ALL', label: 'Mọi kết quả' }, { value: 'SUCCESS', label: 'Thành công' }, { value: 'FAILED', label: 'Thất bại' }]} /></Space>
    {(auth.isError || voting.isError) && <Alert type="error" message="Không tải được một phần nhật ký." />}
    <Table rowKey="id" loading={auth.isPending || voting.isPending} dataSource={rows} scroll={{ x: 700 }}
      columns={[{ title: 'Lúc', dataIndex: 'createdAt', render: dateTime }, { title: 'Người thao tác', dataIndex: 'actorId' },
        { title: 'Hành động', dataIndex: 'action' }, { title: 'Đối tượng', dataIndex: 'target' },
        { title: 'Kết quả', dataIndex: 'outcome', render: (value: string) => value === 'SUCCESS' ? 'Thành công' : 'Thất bại' },
        { title: 'Chi tiết', dataIndex: 'detail' }]}/>
  </Card>;
}
