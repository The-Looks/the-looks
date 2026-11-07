import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppstoreOutlined, HeartOutlined, LogoutOutlined, SkinOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Input } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi, errorMessage, outfitApi, unwrap, votingApi, wardrobeApi } from '../../../services/shared/api/client';
import { formatDate } from '../../../services/shared/format';
import { session } from '../../../services/shared/session';
import { Button, ButtonLink, Card, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { usePreferences } from '../../../hooks/user/outfit/api';
import { ScrollReveal } from '../../../components/shared/home/HomeStory';

export function ProfilePage() {
  const qc = useQueryClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const me = useQuery({ queryKey: ['me'], queryFn: () => unwrap(authApi.GET('/api/app/me')) });
  const authMethods = useQuery({ queryKey: ['me', 'auth-methods'], queryFn: () => unwrap(authApi.GET('/api/app/me/auth-methods')) });
  const wardrobe = useQuery({ queryKey: ['wardrobe', 'list', undefined, undefined], queryFn: () => unwrap(wardrobeApi.GET('/api/app/wardrobe/items')) });
  const outfits = useQuery({ queryKey: ['outfits'], queryFn: () => unwrap(outfitApi.GET('/api/app/outfits')) });
  const polls = useQuery({ queryKey: ['polls'], queryFn: () => unwrap(votingApi.GET('/api/app/polls')) });
  const preferences = usePreferences();

  return <div className="stack-lg">
    <PageHeader eyebrow="HỒ SƠ PHONG CÁCH" title="Tài khoản của tôi" sub="Thông tin và hoạt động của bạn tại THE LOOKS." />
    {me.isPending && <Spinner />}
    {me.isError && <Notice tone="error">{errorMessage(me.error)}</Notice>}
    {me.data && <ScrollReveal><div className="profile-grid">
      <Card>
        <div className="profile-identity"><Avatar size={72} className="user-avatar">{me.data.username.slice(0, 1).toUpperCase()}</Avatar><div><h2>{me.data.username}</h2><p className="muted">{me.data.email}</p><p className="small muted">Tham gia từ {formatDate(me.data.createdAt)}</p></div></div>
        <div className="divider" />
        <div className="profile-stats"><div><SkinOutlined /><strong>{wardrobe.data?.length ?? '—'}</strong><small>Món đồ</small></div><div><AppstoreOutlined /><strong>{outfits.data?.length ?? '—'}</strong><small>Outfit</small></div><div><HeartOutlined /><strong>{polls.data?.length ?? '—'}</strong><small>Bình chọn</small></div></div>
      </Card>
      <Card>
        <h2>Phong cách của bạn</h2>
        <p className="muted">{preferences.data?.styles?.length ? preferences.data.styles.join(', ') : 'Chọn phong cách yêu thích để LOOKSY AI gợi ý gần với gu của bạn hơn.'}</p>
        {preferences.data && <p className="small muted">Giới tính: {preferences.data.gender ?? 'Chưa chọn'} · Ngân sách: {preferences.data.budget ?? 'Chưa chọn'}</p>}
        <ButtonLink to="/profile/style" kind="ghost" small><UserOutlined /> Chỉnh sửa phong cách</ButtonLink>
        <div className="divider" />
        <h2>Dữ liệu của bạn</h2>
        <p className="small muted">Bạn có thể xem và xoá từng món đồ trong tủ bất cứ lúc nào.</p>
        {me.data.permissions?.includes('ADMIN_ACCESS') && <Link to="/admin" className="admin-switch"><AppstoreOutlined /> Mở dashboard quản trị</Link>}
      </Card>
    </div></ScrollReveal>}
    {authMethods.data && !authMethods.data.hasPassword && <Card><h2>Thiết lập mật khẩu</h2>
      <p className="small muted">Bạn đã đăng nhập bằng Google. Đặt mật khẩu để lần sau có thể đăng nhập bằng cả Google và email.</p>
      <div className="stack" style={{ maxWidth: 420 }}>
        <Input.Password placeholder="Mật khẩu mới (ít nhất 8 ký tự)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        <Input.Password placeholder="Nhập lại mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
        {passwordError && <Notice tone="error">{passwordError}</Notice>}
        {passwordSaved && <p role="status">Đã thiết lập mật khẩu. Bạn có thể đăng nhập bằng cả hai cách.</p>}
        <Button disabled={savingPassword || password.length < 8 || password !== confirmPassword} onClick={async () => {
          setSavingPassword(true); setPasswordError('');
          try {
            await unwrap(authApi.POST('/api/app/me/password', { body: { password } }));
            setPassword(''); setConfirmPassword(''); setPasswordSaved(true);
            await qc.invalidateQueries({ queryKey: ['me', 'auth-methods'] });
          } catch (e) { setPasswordError(errorMessage(e)); } finally { setSavingPassword(false); }
        }}>Lưu mật khẩu</Button>
      </div>
    </Card>}
    <Card><div className="spread"><div><h2>Đăng xuất</h2><p className="small muted">Kết thúc phiên đăng nhập trên thiết bị này.</p></div><Button kind="outline" onClick={() => void session.logout()}><LogoutOutlined /> Đăng xuất</Button></div></Card>
  </div>;
}
