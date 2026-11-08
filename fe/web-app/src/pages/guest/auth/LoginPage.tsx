import { useMutation } from '@tanstack/react-query';
import { GoogleOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../../../services/shared/api/client';
import { authRequests } from '../../../services/guest/auth/requests';
import { session, useSession } from '../../../services/shared/session';
import { Button, Field, Notice } from '../../../components/shared/ui/index';
import { AuthHeader } from '../../../components/guest/auth/AuthHeader';
import { SiteFooter } from '../../../components/shared/layout/SiteFooter';
import { PasswordField } from '../../../components/guest/auth/PasswordField';
import type { AuthTransitionContext } from '../../../components/guest/auth/AuthTransitionLayout';

// auth-service — Phát. Contract: auth-api.yaml
export function LoginPage() {
  const mockAuth = import.meta.env.DEV && (import.meta.env.VITE_MOCK_SERVICES?.split(',').map((service) => service.trim()).includes('auth') ?? false);
  const { isAuthenticated } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { previousPath } = useOutletContext<AuthTransitionContext>();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const fromRegister = (location.state as { fromRegister?: boolean } | null)?.fromRegister === true || previousPath === '/register';
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
      <section className={`auth-panel login-panel${fromRegister ? ' login-panel-return' : ''}`}>
        <AuthHeader to="/" label="Trang chủ" />
        <div className="stack"><h1>Đăng nhập</h1><p className="muted">Tiếp tục hành trình phong cách của bạn.</p></div>
        <form className="stack" onSubmit={submit}>
          <Field id="login-email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <PasswordField id="login-password" label="Mật khẩu" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {searchParams.get('google') === 'failed' && <Notice tone="error">Không hoàn tất đăng nhập Google. Vui lòng thử lại.</Notice>}
          {searchParams.get('account-deletion') === 'done' && <p role="status">Tài khoản và dữ liệu của bạn đã được xóa.</p>}
          {searchParams.get('account-deletion') === 'pending' && <Notice tone="error">Yêu cầu xóa đã tiếp nhận nhưng một bước chưa hoàn tất. Hệ thống sẽ thử lại; vui lòng liên hệ hỗ trợ nếu cần đối soát thanh toán.</Notice>}
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
          window.location.assign(new URL('/api/public/auth/google/start', window.location.origin));
        }}>
          <GoogleOutlined /> {mockAuth ? 'Google (mô phỏng)' : 'Đăng nhập bằng Google'}
        </Button>
        <p className="small muted">
          Tiếp tục với Google nghĩa là bạn đồng ý với <Link to="/terms">Điều khoản sử dụng</Link> và{' '}
          <Link to="/privacy">Chính sách quyền riêng tư</Link>.
        </p>
        <p className="auth-note">
          Chưa có tài khoản? <Link to="/register" state={{ fromLogin: true }}>Đăng ký</Link>
        </p>
        {mockAuth && <p className="auth-note">Bản demo admin: admin@thelooks.local · nhập mật khẩu bất kỳ.</p>}
        <SiteFooter variant="auth" />
      </section>
    </main>
  );
}
