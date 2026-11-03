import { useMutation } from '@tanstack/react-query';
import { GoogleOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../../../services/shared/api/client';
import { authRequests } from '../../../services/guest/auth/requests';
import { session, useSession } from '../../../services/shared/session';
import { Brand, Button, Field, Notice } from '../../../components/shared/ui/index';

// auth-service — Phát. Contract: auth-api.yaml
export function LoginPage() {
  const mockAuth = import.meta.env.VITE_MOCK_SERVICES?.split(',').map((service) => service.trim()).includes('auth') ?? false;
  const { isAuthenticated } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = useMutation({
    mutationFn: () => authRequests.login(email, password),
    onSuccess: (res) => {
      session.start(res.expiresAt);
      navigate(from, { replace: true });
    },
  });

  const mockGoogleLogin = useMutation({
    mutationFn: () => authRequests.login('google-demo@thelooks.vn', 'mock-google-login'),
    onSuccess: (res) => {
      session.start(res.expiresAt);
      navigate(from, { replace: true });
    },
  });

  if (isAuthenticated) return <Navigate to={from} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate();
  };

  return (
    <main className="login-scene">
      <div className="login-motion-wall" aria-hidden="true" />
      <section className="auth-panel login-panel">
        <Brand />
        <div className="stack"><span className="eyebrow">CHÀO MỪNG ĐẾN THE LOOKS</span><h2>Đăng nhập</h2><p className="muted">Tiếp tục hành trình phong cách của bạn.</p></div>
        <form className="stack" onSubmit={submit}>
          <Field id="login-email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field id="login-password" label="Mật khẩu" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {searchParams.get('google') === 'failed' && <Notice tone="error">Không hoàn tất đăng nhập Google. Vui lòng thử lại.</Notice>}
          {login.isError && <Notice tone="error">{errorMessage(login.error)}</Notice>}
          {mockGoogleLogin.isError && <Notice tone="error">{errorMessage(mockGoogleLogin.error)}</Notice>}
          <Button type="submit" block disabled={login.isPending}>
            {login.isPending ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </Button>
        </form>
        <Divider plain>hoặc tiếp tục với</Divider>
        <Button kind="outline" block disabled={mockGoogleLogin.isPending} onClick={() => {
          if (mockAuth) {
            mockGoogleLogin.mutate();
            return;
          }
          const origin = import.meta.env.VITE_GOOGLE_ORIGIN || window.location.origin;
          window.location.assign(new URL('/api/public/auth/google/start', origin));
        }}>
          <GoogleOutlined /> {mockAuth ? 'Google (mô phỏng)' : 'Đăng nhập bằng Google'}
        </Button>
        <p className="auth-note">
          Chưa có tài khoản? <Link to="/register" state={{ fromLogin: true }}>Đăng ký</Link>
        </p>
        {import.meta.env.VITE_MOCK_SERVICES?.includes('auth') && <p className="auth-note">Bản demo admin: admin@thelooks.local · nhập mật khẩu bất kỳ.</p>}
      </section>
    </main>
  );
}
