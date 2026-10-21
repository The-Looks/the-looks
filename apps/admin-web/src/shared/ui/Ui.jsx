import Icon from './Icon.jsx';

const TONES = {
  green: ['Hoạt động', 'Hiển thị', 'Thành công', 'Đã gửi', 'Ổn định', 'Đã đối soát', 'Đã thanh toán'],
  amber: ['Chờ xác minh', 'Chờ duyệt', 'Chờ xử lý', 'Chờ đối soát', 'Lên lịch', 'Trung bình'],
  pink: ['Tạm khóa', 'Cần sửa', 'Cao', 'Thất bại'],
  gray: ['Bản nháp', 'Thấp'],
};

export function statusTone(text) {
  const found = Object.entries(TONES).find(([, list]) => list.includes(text));
  return found ? found[0] : 'purple';
}

export function Badge({ children, tone }) {
  return <span className={`badge ${tone || statusTone(children)}`}>{children}</span>;
}

export function PageHead({ crumb, title, subtitle, actions }) {
  return (
    <div className="page-head">
      <div>
        <div className="crumb">{crumb}</div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {actions && <div className="head-actions">{actions}</div>}
    </div>
  );
}

export function StatCard({ icon = 'grid', value, label, note, noteTone = 'purple' }) {
  return (
    <div className="card stat">
      <div className="stat-top">
        <div className="stat-icon">
          <Icon name={icon} />
        </div>
        {note && <span className={`note t-${noteTone}`}>{note}</span>}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function Card({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <div className="card-head">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-sub">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          className={`tab${value === t.value ? ' on' : ''}`}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`switch${on ? ' on' : ''}`}
      onClick={() => onChange(!on)}
    />
  );
}

export function Modal({ children, onClose }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function Avatar({ name, large }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();
  return <div className={`avatar${large ? ' lg' : ''}`}>{initials}</div>;
}

export function BarChart({ data, highlightLast = true, format = (v) => v }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div>
      <div className="bars">
        {data.map((d, i) => (
          <div className="bar-col" key={d.label}>
            <span className="bar-val">{format(d.value)}</span>
            <div
              className={`bar${highlightLast && i === data.length - 1 ? ' hi' : ''}`}
              style={{ height: `${(d.value / max) * 82}%` }}
            />
          </div>
        ))}
      </div>
      <div className="bar-labels">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export function Donut({ segments, centerValue, centerLabel }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <div className="donut">
        <svg viewBox="0 0 140 140" width="150" height="150" role="img" aria-label={`${centerValue} ${centerLabel}`}>
          <circle cx="70" cy="70" r={r} fill="none" stroke="#f1e7fa" strokeWidth="16" />
          {segments.map((s) => {
            const len = (s.value / 100) * c;
            const el = (
              <circle
                key={s.label}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="16"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 70 70)"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="donut-center">
          <b>{centerValue}</b>
          <span>{centerLabel}</span>
        </div>
      </div>
      <div className="legend">
        {segments.map((s) => (
          <span key={s.label}>
            <i className="dot" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function formatVnd(n) {
  return `${n.toLocaleString('vi-VN')}đ`;
}
