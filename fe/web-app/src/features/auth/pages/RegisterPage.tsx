import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, errorMessage, unwrap } from '../../../shared/api/client';
import { session } from '../../../shared/lib/session';
import { Brand, Button, Card, Field, Notice } from '../../../shared/ui';

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  const register = useMutation({
    mutationFn: async () => {
      await unwrap(authApi.POST('/api/public/auth/register', { body: form }));
      return unwrap(authApi.POST('/api/public/auth/login', { body: { email: form.email, password: form.password } }));
    },
    onSuccess: (res) => {
      session.setToken(res.accessToken);
      navigate('/onboarding', { replace: true });
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    register.mutate();
  };

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <Brand />
        <div className="stack">
          <h1>Tạo tài khoản</h1>
          <p className="muted">Wear More. Buy Smarter. Bắt đầu với vài món đồ bạn có.</p>
        </div>
        <form className="stack" onSubmit={submit}>
          <Field id="reg-name" label="Tên hiển thị" required maxLength={60} value={form.username} onChange={set('username')} />
          <Field id="reg-email" label="Email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
          <Field id="reg-password" label="Mật khẩu (tối thiểu 8 ký tự)" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={set('password')} />
          {register.isError && <Notice tone="error">{errorMessage(register.error)}</Notice>}
          <Button type="submit" block disabled={register.isPending}>
            {register.isPending ? 'Đang tạo…' : 'Đăng ký'}
          </Button>
        </form>
        <p className="small muted">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </Card>
    </main>
  );
}
