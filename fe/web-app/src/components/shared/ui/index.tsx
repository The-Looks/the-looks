import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { DoubleLeftOutlined, PictureOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate, type LinkProps } from 'react-router-dom';
import { categoryLabel } from '../../../services/shared/labels';
import { brand } from '../../../services/shared/brand';

type ButtonKind = 'primary' | 'ghost' | 'outline' | 'pink';

export function BackLink({ children, className = '', state, ...props }: LinkProps) {
  const backState = state && typeof state === 'object' && !Array.isArray(state)
    ? { ...state, backNavigation: true }
    : { backNavigation: true };
  return (
    <Link {...props} state={backState} className={['back', 'back-link', className].filter(Boolean).join(' ')}>
      <DoubleLeftOutlined aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}

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
export function ItemTile({ category, imageUrl, label }: { category?: string; imageUrl?: string | null; label?: string }) {
  const name = label ?? categoryLabel(category);
  return (
    <div className="tile" title={name}>
      {imageUrl ? (
        <img src={imageUrl} alt={name} loading="lazy" />
      ) : (
        <>
          <span className="tile-emoji" aria-hidden="true">
            <Garment category={category} />
          </span>
          <span className="tile-label">{name}</span>
        </>
      )}
    </div>
  );
}

export function MotionArtwork({ className = '' }: { className?: string }) {
  return (
    <picture className={['motion-artwork', className].filter(Boolean).join(' ')} aria-hidden="true">
      <source media="(prefers-reduced-motion: reduce)" srcSet={brand.assets.hangerStill} />
      <img src={brand.assets.hangerMotion} width="240" height="240" alt="" loading="lazy" />
    </picture>
  );
}

/** Shows an uploaded asset automatically, with a designed fallback until it exists. */
export function AssetPlaceholder({ label, assetPath, className = '', animated = false }: { label: string; assetPath: string; className?: string; animated?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setLoaded(false); setFailed(false); }, [assetPath]);
  return (
    <div className={['asset-placeholder', loaded && 'has-image', className].filter(Boolean).join(' ')} data-asset-path={assetPath}>
      {!failed && <img className="asset-placeholder-image" src={`/${assetPath.replace(/^\//, '')}`} alt={label} loading="lazy" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
      {!loaded && <>{animated ? <MotionArtwork className="asset-motion" /> : <PictureOutlined aria-hidden="true" />}<span>{label}</span><small>Ảnh sẽ được bổ sung</small></>}
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
  title: ReactNode;
  eyebrow?: string;
  sub?: string;
  back?: { to: string; label: string };
  action?: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const showBack = back ?? (location.pathname !== '/' ? { to: '/', label: 'Quay lại' } : undefined);
  return (
    <header className="page-header">
      {showBack && (
        <button className="back page-back-button" type="button" onClick={() => {
          if (back) navigate(back.to, { state: { backNavigation: true } });
          else if (window.history.state?.idx > 0) navigate(-1);
          else navigate('/', { state: { backNavigation: true } });
        }}>
          <DoubleLeftOutlined aria-hidden="true" />
          <span>{showBack.label}</span>
        </button>
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

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-ico" aria-hidden="true">
        {icon ?? <Icon name="spark" />}
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
  return <span className="brand"><img src={brand.assets.logo} alt={brand.name} /></span>;
}

export function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    home: 'm3 10 9-7 9 7v10H3z M9 20v-7h6v7',
    wardrobe: 'M9 5a3 3 0 0 1 6 0c0 2-3 2-3 4v2 M12 11 2 18v2h20v-2z',
    spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',
    vote: 'm5 9 7-6 7 6-7 6z M5 13H3v8h18v-8h-2',
    user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-2a8 8 0 0 1 16 0v2',
    heart: 'M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 4 1 9 8 15 7-6 12-11 8-15',
    plus: 'M12 4v16 M4 12h16',
    arrow: 'M4 12h16 m-6-6 6 6-6 6',
  };
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] ?? paths.spark} /></svg>;
}

export function Garment({ category }: { category?: string }) {
  const type = category?.toUpperCase();
  return <svg className="garment" viewBox="0 0 120 120" fill="currentColor" stroke="var(--ink)" strokeOpacity=".18" strokeWidth="1.5" aria-hidden="true">
    {type === 'BOTTOM' ? <path d="M35 18h50l5 84H65l-5-55-5 55H30z M35 28h50" /> : type === 'DRESS' ? <path d="M45 16h10q5 12 10 0h10l-3 30 25 58H23l25-58z" /> : type === 'SHOES' ? <path d="M24 42h25l12 24 36 12q10 3 10 17H17V72z M17 87h87" /> : <path d="m38 22 12-5q10 12 20 0l12 5 25 22-16 21-12-9v48H41V56l-12 9-16-21z" />}
  </svg>;
}
