import type { LinkProps } from 'react-router-dom';
import { BackLink, Brand } from '../../shared/ui/index';

export function AuthHeader({ to, label, state }: { to: string; label: string; state?: LinkProps['state'] }) {
  return <header className="auth-panel-header">
    <BackLink to={to} state={state}>{label}</BackLink>
    <Brand />
  </header>;
}
