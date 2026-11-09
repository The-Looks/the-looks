import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppstoreOutlined, HeartOutlined, LogoutOutlined, SkinOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Input, Select } from 'antd';
import { plain, VN_CITIES } from '../../../services/shared/vnCities';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, errorMessage, outfitApi, unwrap, votingApi, wardrobeApi } from '../../../services/shared/api/client';
import { formatDate } from '../../../services/shared/format';
import { session } from '../../../services/shared/session';
import { Button, ButtonLink, Card, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import { usePreferences } from '../../../hooks/user/outfit/api';
import { ScrollReveal } from '../../../components/shared/home/HomeStory';
import { accountAvatar } from '../../../components/user/mascot/accountAvatar';
import { profileKey, profileRequests } from '../../../services/user/profile/requests';
import { clearProfileDraft, readProfileDraft, writeProfileDraft } from '../../../services/user/profile/draft';

/** 34 tỉnh / thành; thành phố đã lưu từ trước (gõ tay) vẫn giữ trong danh sách để không mất. */
const cityOptions = (current: string) => [
  ...(current && !(VN_CITIES as readonly string[]).includes(current) ? [{ value: current, label: `${current} (đã lưu)` }] : []),
  ...VN_CITIES.map((name) => ({ value: name, label: name })),
];

export function ProfilePage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deletionError, setDeletionError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const me = useQuery({ queryKey: ['me'], queryFn: () => unwrap(authApi.GET('/api/app/me')) });
  const profile = useQuery({ queryKey: profileKey, queryFn: profileRequests.get });
  const authMethods = useQuery({ queryKey: ['me', 'auth-methods'], queryFn: () => unwrap(authApi.GET('/api/app/me/auth-methods')) });
  const wardrobe = useQuery({ queryKey: ['wardrobe', 'list', undefined, undefined], queryFn: () => unwrap(wardrobeApi.GET('/api/app/wardrobe/items')) });
  const outfits = useQuery({ queryKey: ['outfits'], queryFn: () => unwrap(outfitApi.GET('/api/app/outfits')) });
  const polls = useQuery({ queryKey: ['polls'], queryFn: () => unwrap(votingApi.GET('/api/app/polls')) });
  const preferences = usePreferences();

  useEffect(() => {
    if (profile.data && me.data) {
      const draft = readProfileDraft(me.data.id);
      setUsername(draft?.username ?? profile.data.username);
      setCity(draft?.city ?? profile.data.city ?? '');
      setDraftSaved(Boolean(draft));
    }
  }, [profile.data, me.data]);

  const updateDraft = (name: string, location: string) => {
    setUsername(name); setCity(location); setProfileSaved(false);
    if (!profile.data || !me.data) return;
    if (name === profile.data.username && location === (profile.data.city ?? '')) {
      clearProfileDraft(me.data.id);
      setDraftSaved(false);
    } else setDraftSaved(writeProfileDraft(me.data.id, name, location));
  };

  const saveProfile = async () => {
    setSavingProfile(true); setProfileError(''); setProfileSaved(false);
    try {
      const updated = await profileRequests.update(username.trim(), city.trim());
      if (me.data) clearProfileDraft(me.data.id);
      setDraftSaved(false);
      qc.setQueryData(['me', 'profile'], updated);
      await qc.invalidateQueries({ queryKey: ['me'] });
      setProfileSaved(true);
    } catch (error) { setProfileError(errorMessage(error)); }
    finally { setSavingProfile(false); }
  };

  const uploadAvatar = async (file: File) => {
    setUploadingAvatar(true); setProfileError('');
    try { qc.setQueryData(profileKey, await profileRequests.uploadAvatar(file)); }
    catch (error) { setProfileError(errorMessage(error)); }
    finally { setUploadingAvatar(false); }
  };

  const deleteAccount = async () => {
    if (!me.data || confirmEmail.trim() !== me.data.email ||
        !window.confirm('Xóa vĩnh viễn tài khoản và dữ liệu của bạn? Hành động này không thể hoàn tác.')) return;
    setDeletingAccount(true); setDeletionError('');
    try {
      const job = await profileRequests.deleteAccount();
      session.clear();
      qc.clear();
      navigate(`/login?account-deletion=${job.status === 'DONE' ? 'done' : 'pending'}`, { replace: true });
    } catch (error) { setDeletionError(errorMessage(error)); setDeletingAccount(false); }
  };

  return <div className="stack-lg">
    <PageHeader eyebrow="HỒ SƠ PHONG CÁCH" title="Tài khoản của tôi" sub="Thông tin và hoạt động của bạn tại THE LOOKS." />
    {me.isPending && <Spinner />}
    {me.isError && <Notice tone="error">{errorMessage(me.error)}</Notice>}
    {me.data && <ScrollReveal><div className="profile-grid">
      <Card>
        <div className="profile-identity"><Avatar size={72} className="user-avatar" alt=""
          src={accountAvatar(me.data.id, profile.data)}>
          {(profile.data?.username ?? me.data.username).slice(0, 1).toUpperCase()}</Avatar>
          <div><h2>{profile.data?.username ?? me.data.username}</h2><p className="muted">{me.data.email}</p>
            <p className="small muted">{profile.data?.city || 'Chưa chọn thành phố'} · Tham gia từ {formatDate(me.data.createdAt)}</p>
            <ButtonLink to="/profile/mascot" kind="ghost" small>Chọn hoặc tạo linh vật</ButtonLink></div></div>
        <div className="divider" />
        <div className="profile-stats"><div><SkinOutlined /><strong>{wardrobe.data?.length ?? '—'}</strong><small>Món đồ</small></div><div><AppstoreOutlined /><strong>{outfits.data?.length ?? '—'}</strong><small>Outfit</small></div><div><HeartOutlined /><strong>{polls.data?.length ?? '—'}</strong><small>Bình chọn</small></div></div>
      </Card>
      <Card>
        <h2>Phong cách của bạn</h2>
        <p className="muted">{preferences.data?.styles?.length ? preferences.data.styles.join(', ') : 'Chọn phong cách yêu thích để THE LOOKS AI gợi ý gần với gu của bạn hơn.'}</p>
        {preferences.data && <p className="small muted">Giới tính: {preferences.data.gender ?? 'Chưa chọn'} · Ngân sách: {preferences.data.budget ?? 'Chưa chọn'}</p>}
        <ButtonLink to="/profile/style" kind="ghost" small><UserOutlined /> Chỉnh sửa phong cách</ButtonLink>
        <div className="divider" />
        <h2>Dữ liệu của bạn</h2>
        <p className="small muted">Bạn có thể xem và xoá từng món đồ trong tủ bất cứ lúc nào.</p>
        {me.data.permissions?.includes('ADMIN_ACCESS') && <Link to="/admin" className="admin-switch"><AppstoreOutlined /> Mở dashboard quản trị</Link>}
      </Card>
    </div></ScrollReveal>}
    {me.data && <Card><h2>Thông tin cá nhân</h2>
      <p className="small muted">Thành phố được dùng để lấy thời tiết cho gợi ý trang phục.</p>
      {profile.isError && <Notice tone="error">{errorMessage(profile.error)}</Notice>}
      {profileError && <Notice tone="error">{profileError}</Notice>}
      {profileSaved && <p role="status">Đã lưu hồ sơ.</p>}
      {draftSaved && <p className="small muted" role="status">Nháp được lưu trên trình duyệt này.</p>}
      <div className="stack" style={{ maxWidth: 440 }}>
        <label htmlFor="profile-name">Tên hiển thị</label>
        <Input id="profile-name" maxLength={60} value={username} disabled={!profile.data} onChange={(event) => updateDraft(event.target.value, city)} />
        <label htmlFor="profile-city">Thành phố</label>
        <Select id="profile-city" showSearch allowClear placeholder="Chọn tỉnh / thành phố" value={city || undefined} disabled={!profile.data}
          options={cityOptions(city)} filterOption={(input, option) => plain(String(option?.value ?? '')).includes(plain(input))}
          onChange={(value?: string) => updateDraft(username, value ?? '')} style={{ width: '100%' }} />
        <Button disabled={!profile.data || !username.trim() || savingProfile} onClick={() => void saveProfile()}>
          {savingProfile ? 'Đang lưu…' : 'Lưu hồ sơ'}</Button>
        <label htmlFor="profile-avatar">Ảnh đại diện (PNG/JPEG, tối đa 2 MB)</label>
        <input id="profile-avatar" type="file" accept="image/png,image/jpeg" disabled={uploadingAvatar}
          onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAvatar(file); event.target.value = ''; }} />
        {profile.data?.hasAvatar && <Button kind="outline" disabled={uploadingAvatar} onClick={async () => {
          setProfileError('');
          try { qc.setQueryData(profileKey, await profileRequests.removeAvatar()); }
          catch (error) { setProfileError(errorMessage(error)); }
        }}>Xóa ảnh đại diện</Button>}
      </div>
    </Card>}
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
    {me.data && <Card><h2>Xóa tài khoản</h2>
      <p className="small muted">Tài khoản và dữ liệu ở các dịch vụ sẽ bị xóa vĩnh viễn. Đơn thanh toán được giữ lại dưới dạng không gắn với tài khoản. Nếu một bước lỗi, hệ thống sẽ thử lại; đơn chưa đối soát cần được hỗ trợ xử lý.</p>
      <div className="stack" style={{ maxWidth: 440 }}>
        <label htmlFor="delete-confirm-email">Nhập email {me.data.email} để xác nhận</label>
        <Input id="delete-confirm-email" autoComplete="off" value={confirmEmail} onChange={(event) => setConfirmEmail(event.target.value)} />
        {deletionError && <Notice tone="error">{deletionError}</Notice>}
        <Button disabled={deletingAccount || confirmEmail.trim() !== me.data.email}
          onClick={() => void deleteAccount()}>{deletingAccount ? 'Đang xử lý…' : 'Xóa tài khoản của tôi'}</Button>
      </div>
    </Card>}
  </div>;
}
