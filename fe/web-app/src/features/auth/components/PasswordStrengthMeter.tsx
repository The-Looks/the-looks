import type { components } from '../../../shared/api/schema/auth';
import { assessPasswordStrength } from '../passwordStrength';

type PasswordPolicy = components['schemas']['PasswordPolicy'];

const labels = { empty: 'Chưa nhập', weak: 'Yếu', medium: 'Trung bình', strong: 'Mạnh' };

export function PasswordStrengthMeter({ password, policy }: { password: string; policy: PasswordPolicy }) {
  const strength = assessPasswordStrength(password, policy);

  return (
    <div className="password-strength" id="password-strength-hint" aria-live="polite">
      <div className="spread small"><span>Độ mạnh mật khẩu</span><strong>{labels[strength.level]}</strong></div>
      <div className={`password-strength-track level-${strength.level}`} role="meter" aria-label="Độ mạnh mật khẩu" aria-valuemin={0} aria-valuemax={100} aria-valuenow={strength.percent} aria-valuetext={labels[strength.level]}>
        <span style={{ width: `${strength.percent}%` }} />
      </div>
      <p className="small muted">Tối thiểu {policy.minLength} ký tự. Nên dùng {policy.strongLength} ký tự và {policy.recommendedCharacterTypes} loại ký tự.</p>
    </div>
  );
}
