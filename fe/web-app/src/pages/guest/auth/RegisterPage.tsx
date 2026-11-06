import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { errorMessage } from '../../../services/shared/api/client';
import { authRequests } from '../../../services/guest/auth/requests';
import { session } from '../../../services/shared/session';
import { Brand, Button, Field, Notice } from '../../../components/shared/ui/index';
import { PasswordStrengthMeter } from '../../../components/guest/auth/PasswordStrengthMeter';
import { AuthMotionBackground } from '../../../components/guest/auth/AuthMotionBackground';
import { PasswordField } from '../../../components/guest/auth/PasswordField';
import type { AuthTransitionContext } from '../../../components/guest/auth/AuthTransitionLayout';
import { assessPasswordStrength } from '../../../services/guest/auth/passwordStrength';
import { usePasswordPolicy } from '../../../hooks/guest/auth/usePasswordPolicy';

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { previousPath } = useOutletContext<AuthTransitionContext>();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const policy = usePasswordPolicy();
  const strength = policy.data && assessPasswordStrength(form.password, policy.data);
  const passwordsMatch = confirmPassword === form.password;
  const animateFromLogin = (location.state as { fromLogin?: boolean } | null)?.fromLogin === true || previousPath === '/login';

  const register = useMutation({
    mutationFn: async () => {
      await authRequests.register({ ...form, acceptedTerms: accepted });
      return authRequests.login(form.email, form.password);
    },
    onSuccess: (res) => {
      session.start(res.expiresAt);
      navigate('/onboarding', { replace: true });
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!strength?.meetsMinimum || !passwordsMatch || !accepted) return;
    register.mutate();
  };

  return (
    <main className="auth-scene register-scene">
      <AuthMotionBackground />
      <aside className="auth-story register-story">
        <Brand />
        <h1>Bắt đầu phong cách <em>của riêng bạn.</em></h1>
        <p>Lưu tủ đồ, khám phá bộ phối mới và hỏi bạn bè chỉ bằng một đường link.</p>
      </aside>
      <section className={`auth-panel register-panel${animateFromLogin ? ' register-panel-enter' : ''}`}>
        <Link className="back" to="/login" state={{ fromRegister: true }}>‹ Đăng nhập</Link>
        <Brand />
        <div className="stack"><span className="eyebrow">BẮT ĐẦU CÙNG THE LOOKS</span><h2>Tạo tài khoản</h2><p className="muted">Chỉ mất một phút để bắt đầu.</p></div>
        <form className="stack" onSubmit={submit}>
          <Field id="reg-name" label="Tên người dùng" required maxLength={60} value={form.username} onChange={set('username')} />
          <Field id="reg-email" label="Email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
          <PasswordField id="reg-password" label="Mật khẩu" autoComplete="new-password" minLength={policy.data?.minLength} required aria-describedby={policy.data ? 'password-strength-hint' : undefined} value={form.password} onChange={set('password')} />
          {policy.isPending && <p className="small muted">Đang tải quy tắc mật khẩu…</p>}
          {policy.isError && <Notice tone="error">Không tải được quy tắc mật khẩu. Vui lòng thử lại.</Notice>}
          {policy.data && <PasswordStrengthMeter password={form.password} policy={policy.data} />}
          <PasswordField id="reg-confirm" label="Xác nhận mật khẩu" autoComplete="new-password" required aria-invalid={!!confirmPassword && !passwordsMatch} aria-describedby={confirmPassword && !passwordsMatch ? 'confirm-password-error' : undefined} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {confirmPassword && !passwordsMatch && <p id="confirm-password-error" className="small register-error" role="alert">Mật khẩu xác nhận không khớp.</p>}
          <label className="row small" htmlFor="reg-terms" style={{ alignItems: 'flex-start', gap: 8 }}>
            <input id="reg-terms" type="checkbox" required checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            <span>
              Tôi đã đọc và đồng ý với <Link to="/terms" target="_blank">Điều khoản sử dụng</Link> và{' '}
              <Link to="/privacy" target="_blank">Chính sách quyền riêng tư</Link>, bao gồm việc ảnh tủ đồ được xử lý bằng dịch vụ AI
              và lưu trữ trên máy chủ ngoài Việt Nam.
            </span>
          </label>
          {register.isError && <Notice tone="error">{errorMessage(register.error)}</Notice>}
          <Button type="submit" block disabled={register.isPending || !strength?.meetsMinimum || !passwordsMatch || !confirmPassword || !accepted}>
            {register.isPending ? 'Đang tạo…' : 'Đăng ký'}
          </Button>
        </form>
        <p className="auth-note">
          Đã có tài khoản? <Link to="/login" state={{ fromRegister: true }}>Đăng nhập</Link>
        </p>
      </section>
    </main>
  );
}
