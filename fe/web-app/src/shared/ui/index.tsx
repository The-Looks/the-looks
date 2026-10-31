import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORY_EMOJI, categoryLabel } from '../lib/labels';

type ButtonKind = 'primary' | 'ghost' | 'outline' | 'pink';

export function Button({
  kind = 'primary',
  small,
  block,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { kind?: ButtonKind; small?: boolean; block?: boolean }) {
  const cls = ['btn', kind !== 'primary' && `btn-${kind}`, small && 'btn-sm', block && 'btn-block', className]
    .filter(Boolean)
    .join(' ');
  return <button type="button" className={cls} {...props} />;
}

export function ButtonLink({
  to,
  kind = 'primary',
  small,
  children,
}: {
  to: string;
  kind?: ButtonKind;
  small?: boolean;
  children: ReactNode;
}) {
  const cls = ['btn', kind !== 'primary' && `btn-${kind}`, small && 'btn-sm'].filter(Boolean).join(' ');
  return (
    <Link to={to} className={cls}>
      {children}
    </Link>
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="chip" aria-pressed={!!active} onClick={onClick}>
      {children}
    </button>
  );
}

export function Card({ children, hero, className = '' }: { children: ReactNode; hero?: boolean; className?: string }) {
  return <section className={['card', hero && 'card-hero', className].filter(Boolean).join(' ')}>{children}</section>;
}

export function Badge({ children, tone }: { children: ReactNode; tone?: 'green' | 'amber' | 'pink' }) {
  return <span className={tone ? `badge badge-${tone}` : 'badge'}>{children}</span>;
}

/** Ảnh món đồ; chưa có ảnh thì hiện biểu tượng theo loại đồ. */
export function ItemTile({ category, imageUrl, label }: { category?: string; imageUrl?: string; label?: string }) {
  const name = label ?? categoryLabel(category);
  return (
    <div className="tile" title={name}>
      {imageUrl ? (
        <img src={imageUrl} alt={name} loading="lazy" />
      ) : (
        <>
          <span className="tile-emoji" aria-hidden="true">
            {CATEGORY_EMOJI[category?.toUpperCase() ?? ''] ?? '👚'}
          </span>
          <span className="tile-label">{name}</span>
        </>
      )}
    </div>
  );
}

export function Field({ label, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
    </div>
  );
}

export function PageHeader({
  title,
  eyebrow,
  sub,
  back,
  action,
}: {
  title: string;
  eyebrow?: string;
  sub?: string;
  back?: { to: string; label: string };
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      {back && (
        <Link className="back" to={back.to}>
          ‹ {back.label}
        </Link>
      )}
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <div className="spread">
        <h1>{title}</h1>
        {action}
      </div>
      {sub && <p className="muted">{sub}</p>}
    </header>
  );
}

export function EmptyState({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-ico" aria-hidden="true">
        {icon}
      </span>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function Spinner({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <div className="row muted" role="status">
      <span className="spinner" aria-hidden="true" />
      {label}
    </div>
  );
}

export function Notice({ children, tone }: { children: ReactNode; tone?: 'error' | 'warn' }) {
  return (
    <div className={tone ? `notice notice-${tone}` : 'notice'} role={tone === 'error' ? 'alert' : undefined}>
      {children}
    </div>
  );
}

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}

export function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true" />
      THE LOOKS
    </span>
  );
}
