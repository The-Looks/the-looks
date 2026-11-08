import { BackButton, Brand } from '../../shared/ui/index';

export function AuthHeader({ to, fixed, state }: { to: string; fixed?: boolean; state?: Record<string, unknown> }) {
  return <header className="auth-panel-header">
    <BackButton to={to} fixed={fixed} state={state} />
    <Brand />
  </header>;
}
