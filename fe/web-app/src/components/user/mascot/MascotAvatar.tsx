import type { ReactNode } from 'react';
import { ANCHORS, MASCOTS } from '../../../services/user/onboarding/mascots';
import { ACCESSORIES, backgroundColor, type Look } from '../../../services/user/onboarding/look';

// Bảng màu và nét viền giống bộ linh vật (public/illustrations).
const INK = '#241d21';
const CREAM = '#fff7f3';
const PINK = '#f5dce1';
const WINE = '#771e35';
const DENIM = '#4a6882';
const MOSS = '#648653';
const GOLD = '#e7b347';
const ROSE = '#e0617f';

/** Mũ vẽ quanh gốc (0, 0) = giữa vành mũ, rộng 100. */
function Hat({ id }: { id: string }) {
  switch (id) {
    case 'beanie': return <>
      <path d="M -46 0 C -48 -52, 48 -52, 46 0 Z" fill={WINE} />
      <path d="M -20 -8 Q -16 -30 -10 -40 M 0 -8 L 0 -44 M 20 -8 Q 16 -30 10 -40" fill="none" stroke="#5e1528" strokeWidth="0.6em" />
      <rect x="-52" y="-14" width="104" height="18" rx="7" fill={CREAM} />
      <circle cx="0" cy="-50" r="11" fill={PINK} />
    </>;
    case 'cap': return <>
      <path d="M -46 0 C -46 -48, 46 -48, 46 0 Z" fill={DENIM} />
      <path d="M 0 -42 L 0 -2 M -26 -34 Q -18 -18 -16 -2 M 26 -34 Q 18 -18 16 -2" fill="none" stroke={INK} strokeWidth="0.5em" />
      <path d="M 26 -4 C 56 -8, 82 -2, 86 8 C 64 12, 40 8, 18 4 Z" fill={DENIM} />
      <circle cx="0" cy="-44" r="5" fill={WINE} />
    </>;
    case 'bucket': return <>
      <path d="M -34 -6 L -28 -42 C -10 -50, 10 -50, 28 -42 L 34 -6 Z" fill={MOSS} />
      <path d="M -31 -18 C -10 -12, 10 -12, 31 -18" fill="none" stroke={CREAM} strokeWidth="0.9em" />
      <path d="M -60 4 C -46 -14, 46 -14, 60 4 C 44 12, -44 12, -60 4 Z" fill={MOSS} />
    </>;
    case 'beret': return <>
      <path d="M -50 -6 C -56 -34, 6 -52, 46 -36 C 64 -28, 58 -8, 40 -2 C 14 6, -36 6, -50 -6 Z" fill={WINE} />
      <path d="M 2 -48 L 4 -58" fill="none" stroke={INK} strokeWidth="1em" strokeLinecap="round" />
      <path d="M -30 -10 C -6 -4, 22 -6, 40 -14" fill="none" stroke="#5e1528" strokeWidth="0.6em" />
    </>;
    case 'crown': return <>
      <path d="M -40 0 L -46 -40 L -22 -20 L 0 -50 L 22 -20 L 46 -40 L 40 0 Z" fill={GOLD} />
      <circle cx="-46" cy="-42" r="5" fill={GOLD} /><circle cx="0" cy="-52" r="5" fill={GOLD} /><circle cx="46" cy="-42" r="5" fill={GOLD} />
      <circle cx="0" cy="-14" r="6" fill={ROSE} /><circle cx="-24" cy="-10" r="4" fill={DENIM} /><circle cx="24" cy="-10" r="4" fill={DENIM} />
    </>;
    case 'flowers': return <>
      <path d="M -48 0 C -40 -26, 40 -26, 48 0" fill="none" stroke={MOSS} strokeWidth="1.4em" strokeLinecap="round" />
      {[[-40, -10, ROSE], [-20, -20, GOLD], [0, -24, PINK], [20, -20, GOLD], [40, -10, ROSE]].map(([x, y, c]) => (
        <g key={`${x}`} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-7" rx="5" ry="7" transform={`rotate(${a})`} fill={c as string} />)}
          <circle r="4" fill={CREAM} />
        </g>
      ))}
    </>;
    default: return null;
  }
}

/** Kính vẽ quanh gốc = giữa hai mắt, hai mắt cách nhau 30. */
function Glasses({ id }: { id: string }) {
  const lenses = (shape: (x: number) => ReactNode) => <>{shape(-15)}{shape(15)}</>;
  const arms = <path d="M -27 -2 L -36 -6 M 27 -2 L 36 -6 M -4 -1 Q 0 -5 4 -1" fill="none" stroke={INK} strokeWidth="0.7em" strokeLinecap="round" />;
  switch (id) {
    case 'round': return <>{arms}{lenses((x) => <circle key={x} cx={x} cy="0" r="11" fill="rgba(255,255,255,0.35)" />)}</>;
    case 'sunglasses': return <>{arms}{lenses((x) => <g key={x}>
      <rect x={x - 12} y="-8" width="24" height="17" rx="7" fill={INK} />
      <path d={`M ${x - 6} -3 L ${x - 1} -3`} stroke={CREAM} strokeWidth="0.6em" strokeLinecap="round" />
    </g>)}</>;
    case 'heart': return <>{arms}{lenses((x) => (
      <path key={x} d={`M ${x} 10 C ${x - 18} -2, ${x - 12} -14, ${x} -6 C ${x + 12} -14, ${x + 18} -2, ${x} 10 Z`} fill={ROSE} />
    ))}</>;
    case 'star': return <>{arms}{lenses((x) => (
      <path key={x} d={`M ${x} -13 L ${x + 4} -4 L ${x + 13} -3 L ${x + 6} 3 L ${x + 8} 12 L ${x} 7 L ${x - 8} 12 L ${x - 6} 3 L ${x - 13} -3 L ${x - 4} -4 Z`} fill={GOLD} />
    ))}</>;
    default: return null;
  }
}

/** Phụ kiện cổ vẽ quanh gốc = giữa cổ áo, rộng 100. */
function Neck({ id }: { id: string }) {
  switch (id) {
    case 'scarf': return <>
      <path d="M -52 -10 C -20 4, 20 4, 52 -10 L 54 10 C 20 24, -20 24, -54 10 Z" fill={ROSE} />
      <path d="M 18 12 L 40 12 L 44 70 L 22 70 Z" fill={ROSE} />
      <path d="M 24 70 L 24 80 M 30 70 L 30 80 M 36 70 L 36 80 M 42 70 L 42 80" fill="none" stroke={INK} strokeWidth="0.6em" strokeLinecap="round" />
      <path d="M -30 2 L -30 16 M 0 6 L 0 20 M 30 2 L 30 16" fill="none" stroke="#c14a67" strokeWidth="0.5em" />
    </>;
    case 'bowtie': return <>
      <path d="M -6 0 L -40 -18 L -40 18 Z M 6 0 L 40 -18 L 40 18 Z" fill={WINE} />
      <rect x="-9" y="-9" width="18" height="18" rx="5" fill="#5e1528" />
    </>;
    case 'pearls': return <>
      {[-44, -32, -20, -7, 7, 20, 32, 44].map((x) => <circle key={x} cx={x} cy={14 - (x * x) / 220} r="6" fill={CREAM} />)}
    </>;
    case 'bandana': return <>
      <path d="M -50 -6 C -20 4, 20 4, 50 -6 L 0 52 Z" fill={DENIM} />
      {[[-18, 8], [12, 10], [-2, 26], [18, 26], [-6, 40]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3.5" fill={CREAM} stroke="none" />)}
    </>;
    default: return null;
  }
}

function Part({ x, y, scale, children }: { x: number; y: number; scale: number; children: ReactNode }) {
  // em = nét viền 2.6 đơn vị của hình gốc, không phụ thuộc tỉ lệ phóng của phụ kiện
  const stroke = 2.6 / scale;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={INK} strokeWidth={stroke} strokeLinejoin="round"
      style={{ fontSize: stroke }}>
      {children}
    </g>
  );
}

/** Khung cắt ảnh đại diện; nới lên trên khi đội mũ để không cắt mất đỉnh mũ. */
function portraitBox(look: Look) {
  const anchor = ANCHORS[look.mascot];
  const [x, y, size] = anchor.portrait;
  if (!look.hat) return `${x} ${y} ${size} ${size}`;
  const top = Math.min(y, anchor.hat.y - 0.62 * anchor.hat.w);
  const side = y + size - top;
  return `${160 - side / 2} ${top} ${side} ${side}`;
}

/**
 * Linh vật kèm phụ kiện người dùng chọn. portrait = chỉ phần đầu, cho ảnh đại diện.
 * Ếch có sẵn mũ nồi trong hình gốc: đội mũ khác thì dùng bản không mũ.
 */
export function MascotAvatar({ look, portrait = false, title }: { look: Look; portrait?: boolean; title?: string }) {
  // title="": hình trang trí (đã có chữ bên cạnh), trình đọc màn hình bỏ qua
  const anchor = ANCHORS[look.mascot];
  const image = look.mascot === 'frog' && look.hat ? '/illustrations/frog-bare.svg' : `/illustrations/${look.mascot}.svg`;
  const bg = backgroundColor(look);
  const label = title ?? [MASCOTS.find((m) => m.id === look.mascot)?.name,
    ...(['hat', 'glasses', 'neck'] as const).map((slot) => ACCESSORIES[slot].find((a) => a.id === look[slot])?.name)]
    .filter(Boolean).join(', ');
  return (
    <svg className="mascot-avatar" viewBox={portrait ? portraitBox(look) : '0 0 320 320'}
      {...(title === '' ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
      width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {bg && <rect x="-40" y="-40" width="400" height="400" fill={bg} />}
      <image href={image} x="0" y="0" width="320" height="320" />
      {look.neck && <Part x={anchor.neck.x} y={anchor.neck.y} scale={anchor.neck.w / 100}><Neck id={look.neck} /></Part>}
      {look.glasses && <Part x={anchor.eyes.x} y={anchor.eyes.y} scale={anchor.eyes.d / 30}><Glasses id={look.glasses} /></Part>}
      {look.hat && <Part x={anchor.hat.x} y={anchor.hat.y} scale={anchor.hat.w / 100}><Hat id={look.hat} /></Part>}
    </svg>
  );
}
