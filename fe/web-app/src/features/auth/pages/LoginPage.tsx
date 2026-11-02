import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi, errorMessage, unwrap } from '../../../shared/api/client';
import { session, useSession } from '../../../shared/lib/session';
import { Brand, Button, Card, Field, Notice } from '../../../shared/ui';

// auth-service — Phát. Contract: auth-api.yaml
export function LoginPage() {
  const { isAuthenticated } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = useMutation({
    mutationFn: () => unwrap(authApi.POST('/api/public/auth/login', { body: { email, password } })),
    onSuccess: (res) => {
      session.setToken(res.accessToken);
      navigate(from, { replace: true });
    },
  });

  if (isAuthenticated) return <Navigate to={from} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate();
  };

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <Brand />
        <div className="stack">
          <h1>Chào mừng trở lại</h1>
          <p className="muted">Đăng nhập để xem tủ đồ và gợi ý phối đồ hôm nay.</p>
        </div>
        <form className="stack" onSubmit={submit}>
          <Field id="login-email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field id="login-password" label="Mật khẩu" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {searchParams.get('google') === 'failed' && <Notice tone="error">Không hoàn tất đăng nhập Google. Vui lòng thử lại.</Notice>}
          {login.isError && <Notice tone="error">{errorMessage(login.error)}</Notice>}
          <Button type="submit" block disabled={login.isPending}>
            {login.isPending ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </Button>
        </form>
        <Button kind="outline" block onClick={() => window.location.assign('/api/public/auth/google/start')}>
          Đăng nhập bằng Google
        </Button>
        <p className="small muted">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </Card>
    </main>
  );
}
