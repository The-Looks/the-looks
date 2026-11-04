import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Icon from '../../shared/ui/Icon.jsx';
import { useStore } from '../../shared/store.jsx';

export default function Login() {
  const { authed, login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@thelooks.vn');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (authed) return <Navigate to="/" replace />;

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }
    login();
    navigate('/');
  };

  return (
    <div className="login">
      <div className="login-art">
        <div className="login-logo">the LOOKS</div>
        <div>
          <h2>
            Một nơi quản trị.
            <span>Một trải nghiệm thống nhất.</span>
          </h2>
          <p style={{ marginTop: 12 }}>Theo dõi tài khoản và hỗ trợ cộng đồng LOOKSY.</p>
        </div>
        {['Quản lý người dùng', 'Theo dõi trạng thái', 'Lưu nhật ký thao tác'].map((t) => (
          <div className="feature" key={t}>
            <i>✓</i>
            {t}
          </div>
        ))}
      </div>
      <div className="login-form-wrap">
        <form className="login-card" onSubmit={submit}>
          <div className="eyebrow">ADMIN PORTAL</div>
          <h1>Đăng nhập quản trị</h1>
          <p className="sub">Chỉ tài khoản Admin mới có quyền truy cập.</p>
          <div className="field">
            <label htmlFor="email">Email quản trị</label>
            <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pw">Mật khẩu</label>
            <input
              id="pw"
              className="input"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="forgot">
            <button type="button" className="link">Quên mật khẩu?</button>
          </div>
          {error && <p className="warn">{error}</p>}
          <button type="submit" className="btn primary">Đăng nhập</button>
          <div className="login-note">
            <Icon name="shield" size={16} />
            Quyền truy cập được giới hạn theo vai trò Admin.
          </div>
        </form>
      </div>
    </div>
  );
}
