import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi, errorMessage, unwrap } from '../../../shared/api/client';
import { session } from '../../../shared/lib/session';
import { Brand, Button, Field, Notice } from '../../../shared/ui';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { assessPasswordStrength } from '../passwordStrength';

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const policy = useQuery({
    queryKey: ['password-policy'],
    queryFn: () => unwrap(authApi.GET('/api/public/auth/password-policy')),
    staleTime: 60 * 60_000,
  });
  const strength = policy.data && assessPasswordStrength(form.password, policy.data);
  const passwordsMatch = confirmPassword === form.password;
  const animateFromLogin = (location.state as { fromLogin?: boolean } | null)?.fromLogin === true;

  const register = useMutation({
    mutationFn: async () => {
      await unwrap(authApi.POST('/api/public/auth/register', { body: form }));
      return unwrap(authApi.POST('/api/public/auth/login', { body: { email: form.email, password: form.password } }));
    },
    onSuccess: (res) => {
      session.start(res.expiresAt);
      navigate('/onboarding', { replace: true });
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!strength?.meetsMinimum || !passwordsMatch) return;
    register.mutate();
  };

  return (
    <main className="auth-scene register-scene">
      <aside className="auth-story register-story">
        <Brand />
        <h1>Bắt đầu phong cách <em>của riêng bạn.</em></h1>
        <p>Lưu tủ đồ, khám phá bộ phối mới và hỏi bạn bè chỉ bằng một đường link.</p>
      </aside>
      <section className={`auth-panel register-panel${animateFromLogin ? ' register-panel-enter' : ''}`}>
        <Brand />
        <div className="stack"><span className="eyebrow">BẮT ĐẦU CÙNG THE LOOKS</span><h2>Tạo tài khoản</h2><p className="muted">Chỉ mất một phút để bắt đầu.</p></div>
        <form className="stack" onSubmit={submit}>
          <Field id="reg-name" label="Tên người dùng" required maxLength={60} value={form.username} onChange={set('username')} />
          <Field id="reg-email" label="Email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
          <Field id="reg-password" label="Mật khẩu" type="password" autoComplete="new-password" minLength={policy.data?.minLength} required aria-describedby={policy.data ? 'password-strength-hint' : undefined} value={form.password} onChange={set('password')} />
          {policy.isPending && <p className="small muted">Đang tải quy tắc mật khẩu…</p>}
          {policy.isError && <Notice tone="error">Không tải được quy tắc mật khẩu. Vui lòng thử lại.</Notice>}
          {policy.data && <PasswordStrengthMeter password={form.password} policy={policy.data} />}
          <Field id="reg-confirm" label="Xác nhận mật khẩu" type="password" autoComplete="new-password" required aria-invalid={!!confirmPassword && !passwordsMatch} aria-describedby={confirmPassword && !passwordsMatch ? 'confirm-password-error' : undefined} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {confirmPassword && !passwordsMatch && <p id="confirm-password-error" className="small register-error" role="alert">Mật khẩu xác nhận không khớp.</p>}
          {register.isError && <Notice tone="error">{errorMessage(register.error)}</Notice>}
          <Button type="submit" block disabled={register.isPending || !strength?.meetsMinimum || !passwordsMatch || !confirmPassword}>
            {register.isPending ? 'Đang tạo…' : 'Đăng ký'}
          </Button>
        </form>
        <p className="auth-note">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </section>
    </main>
  );
}
