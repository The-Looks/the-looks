import type { ReactNode } from 'react';
import { isModular, type MascotId, type ModularId } from '../../../services/user/onboarding/mascots';

/*
 * Linh vật mặc đồ: mọi con dùng chung một dáng người (khung 320×320, đầu tâm 160,84), nên áo / quần / giày
 * vẽ một lần là mặc vừa cho mọi con. Hình tự vẽ, cùng nét viền và bảng màu với bộ linh vật trong public/illustrations.
 */

const INK = '#241d21';
const CREAM = '#fff7f3';
const BLUSH = '#f5c9d3';
const MIRROR = 'translate(320 0) scale(-1 1)';

type Fur = { body: string; limbs?: string; belly: string };

/** Hai bên giống nhau: vẽ bên trái, lật sang bên phải. */
const Both = ({ children }: { children: ReactNode }) => <>{children}<g transform={MIRROR}>{children}</g></>;

function Eyes({ y = 86, gap = 14, color = INK }: { y?: number; gap?: number; color?: string }) {
  return <Both>
    <ellipse cx={160 - gap} cy={y} rx="4.6" ry="5.6" fill={color} stroke="none" />
    <circle cx={160 - gap - 1.2} cy={y - 2} r="1.6" fill={CREAM} stroke="none" />
  </Both>;
}

const Cheeks = ({ y = 96 }: { y?: number }) => <Both><ellipse cx="134" cy={y} rx="6" ry="3.8" fill={BLUSH} stroke="none" /></Both>;
const Smile = ({ y = 102 }: { y?: number }) => <path d={`M 153 ${y} Q 160 ${y + 6} 167 ${y}`} fill="none" strokeLinecap="round" />;

type Figure = { fur: Fur; back?: ReactNode; head: ReactNode };

export const HEADS: Record<ModularId, Figure> = {
  dog: {
    fur: { body: '#e3b98a', belly: '#f8e6cf' },
    back: <path d="M 190 196 C 214 190, 222 170, 216 160" fill="none" stroke="#e3b98a" strokeWidth="9" strokeLinecap="round" />,
    head: <>
      <circle cx="160" cy="84" r="42" fill="#e3b98a" />
      <Both><path d="M 126 54 C 108 52, 100 80, 108 104 C 112 114, 124 110, 126 98 Z" fill="#9b6a42" /></Both>
      <ellipse cx="160" cy="100" rx="20" ry="15" fill="#f8e6cf" />
      <Eyes y={82} gap={15} /><Cheeks y={94} />
      <ellipse cx="160" cy="94" rx="6.5" ry="4.5" fill={INK} />
      <Smile y={102} />
    </>,
  },
  panda: {
    fur: { body: CREAM, limbs: '#2c2629', belly: CREAM },
    head: <>
      <Both><circle cx="126" cy="50" r="13" fill="#2c2629" /></Both>
      <circle cx="160" cy="84" r="42" fill={CREAM} />
      <Both><ellipse cx="145" cy="86" rx="10" ry="13" transform="rotate(25 145 86)" fill="#2c2629" stroke="none" /></Both>
      <Eyes y={86} gap={15} color={CREAM} />
      <Both><circle cx="146.2" cy="86" r="2.4" fill={INK} stroke="none" /></Both>
      <ellipse cx="160" cy="99" rx="6" ry="4" fill={INK} />
      <Smile y={105} />
    </>,
  },
  tiger: {
    fur: { body: '#e8893a', belly: CREAM },
    back: <path d="M 192 192 C 222 196, 230 168, 214 156" fill="none" stroke="#e8893a" strokeWidth="9" strokeLinecap="round" />,
    head: <>
      <Both><path d="M 124 66 C 116 46, 128 38, 144 48 Z" fill="#e8893a" /><path d="M 128 58 C 126 50, 132 47, 138 51 Z" fill={BLUSH} stroke="none" /></Both>
      <circle cx="160" cy="84" r="42" fill="#e8893a" />
      <path d="M 150 44 L 154 58 M 160 42 L 160 58 M 170 44 L 166 58" fill="none" strokeLinecap="round" />
      <Both><path d="M 119 84 L 132 86 M 120 94 L 132 94" fill="none" strokeLinecap="round" /></Both>
      <ellipse cx="160" cy="100" rx="22" ry="16" fill={CREAM} />
      <Eyes y={82} gap={15} />
      <path d="M 155 93 L 165 93 L 160 99 Z" fill={BLUSH} />
      <Smile y={104} />
    </>,
  },
  koala: {
    fur: { body: '#a9a9b3', belly: '#ececf0' },
    head: <>
      <Both><circle cx="122" cy="66" r="22" fill="#a9a9b3" /><circle cx="122" cy="66" r="13" fill="#ececf0" stroke="none" /></Both>
      <circle cx="160" cy="86" r="40" fill="#a9a9b3" />
      <Eyes y={82} gap={17} /><Cheeks y={100} />
      <ellipse cx="160" cy="96" rx="10" ry="13" fill="#3a3237" />
      <path d="M 154 112 Q 160 116 166 112" fill="none" strokeLinecap="round" />
    </>,
  },
  pig: {
    fur: { body: '#f4b6c2', belly: '#fbdbe2' },
    back: <path d="M 192 186 C 206 184, 204 174, 198 178 C 192 182, 206 192, 212 182" fill="none" stroke="#e28fa2" strokeWidth="4" strokeLinecap="round" />,
    head: <>
      <Both><path d="M 126 60 L 120 38 C 132 40, 142 48, 146 54 Z" fill="#e89aac" /></Both>
      <circle cx="160" cy="84" r="42" fill="#f4b6c2" />
      <Eyes y={80} gap={17} /><Cheeks y={96} />
      <ellipse cx="160" cy="98" rx="15" ry="11" fill="#e89aac" />
      <Both><ellipse cx="154.5" cy="98" rx="2.5" ry="4" fill="#9b4a5e" stroke="none" /></Both>
    </>,
  },
  duck: {
    fur: { body: '#f6d55c', limbs: '#f6d55c', belly: '#fbeaa6' },
    head: <>
      <path d="M 156 44 C 150 30, 160 26, 162 38 C 166 28, 176 32, 166 46" fill="#f6d55c" />
      <circle cx="160" cy="84" r="42" fill="#f6d55c" />
      <Eyes y={80} gap={16} /><Cheeks y={94} />
      <path d="M 140 98 C 140 90, 180 90, 180 98 C 180 108, 140 108, 140 98 Z" fill="#f29a3b" />
      <path d="M 142 99 L 178 99" fill="none" strokeLinecap="round" />
    </>,
  },
  hamster: {
    fur: { body: '#e7b072', belly: CREAM },
    head: <>
      <Both><circle cx="128" cy="52" r="11" fill="#e7b072" /><circle cx="128" cy="52" r="5.5" fill={BLUSH} stroke="none" /></Both>
      <circle cx="160" cy="86" r="42" fill="#e7b072" />
      <path d="M 124 100 C 124 80, 196 80, 196 100 C 196 124, 124 124, 124 100 Z" fill={CREAM} />
      <Eyes y={80} gap={15} /><Cheeks y={98} />
      <ellipse cx="160" cy="94" rx="4" ry="3" fill="#d26a83" />
      <path d="M 154 101 Q 157 104 160 100 Q 163 104 166 101" fill="none" strokeLinecap="round" />
    </>,
  },
  raccoon: {
    fur: { body: '#9a9aa3', belly: '#e4e4e8' },
    back: <g>
      <path d="M 190 190 C 220 200, 236 178, 230 156" fill="none" stroke="#9a9aa3" strokeWidth="13" strokeLinecap="round" />
      <path d="M 218 190 L 228 182 M 228 170 L 238 166" fill="none" stroke="#3a3237" strokeWidth="5" strokeLinecap="round" />
    </g>,
    head: <>
      <Both><path d="M 124 64 L 122 38 C 134 40, 144 48, 146 56 Z" fill="#9a9aa3" /></Both>
      <circle cx="160" cy="84" r="42" fill="#9a9aa3" />
      <path d="M 122 80 C 134 70, 186 70, 198 80 C 194 94, 174 92, 160 88 C 146 92, 126 94, 122 80 Z" fill="#3a3237" />
      <ellipse cx="160" cy="102" rx="18" ry="13" fill="#e4e4e8" />
      <Eyes y={82} gap={15} color={CREAM} />
      <Both><circle cx="145" cy="82" r="2.4" fill={INK} stroke="none" /></Both>
      <ellipse cx="160" cy="97" rx="5" ry="3.5" fill={INK} />
      <Smile y={104} />
    </>,
  },
  lion: {
    fur: { body: '#efc05a', belly: '#fbe6b3' },
    back: <path d="M 192 192 C 220 200, 230 178, 220 164" fill="none" stroke="#efc05a" strokeWidth="7" strokeLinecap="round" />,
    head: <>
      <circle cx="160" cy="84" r="56" fill="#b8682e" />
      <path d="M 104 84 L 96 74 M 110 56 L 104 44 M 130 34 L 128 22 M 160 28 L 160 16 M 190 34 L 192 22 M 210 56 L 216 44 M 216 84 L 224 74"
        fill="none" stroke="#b8682e" strokeWidth="10" strokeLinecap="round" />
      <circle cx="160" cy="86" r="38" fill="#efc05a" />
      <ellipse cx="160" cy="102" rx="18" ry="12" fill="#fbe6b3" />
      <Eyes y={82} gap={14} /><Cheeks y={94} />
      <path d="M 154 95 L 166 95 L 160 101 Z" fill="#7a4a2a" />
      <Smile y={105} />
    </>,
  },
  monkey: {
    fur: { body: '#9b6a42', belly: '#f1d1ad' },
    back: <path d="M 192 190 C 230 196, 236 160, 214 150 C 204 146, 200 156, 208 160" fill="none" stroke="#9b6a42" strokeWidth="7" strokeLinecap="round" />,
    head: <>
      <Both><circle cx="114" cy="84" r="15" fill="#9b6a42" /><circle cx="114" cy="84" r="8" fill="#f1d1ad" stroke="none" /></Both>
      <circle cx="160" cy="82" r="42" fill="#9b6a42" />
      <path d="M 160 82 C 150 66, 126 70, 128 90 C 130 110, 146 120, 160 120 C 174 120, 190 110, 192 90 C 194 70, 170 66, 160 82 Z" fill="#f1d1ad" />
      <Eyes y={86} gap={13} />
      <Both><ellipse cx="156" cy="100" rx="1.6" ry="2.2" fill={INK} stroke="none" /></Both>
      <path d="M 148 108 Q 160 116 172 108" fill="none" strokeLinecap="round" />
    </>,
  },
};

/** Dáng người chung: chân, thân, tay. Panda / vịt có màu tay chân riêng. */
function Body({ fur }: { fur: Fur }) {
  const limbs = fur.limbs ?? fur.body;
  return <>
    <Both>
      <path d="M 134 184 L 134 254 Q 134 260 140 260 L 152 260 Q 158 260 158 254 L 158 184 Z" fill={limbs} />
      <ellipse cx="146" cy="264" rx="17" ry="9" fill={limbs} />
    </Both>
    <path d="M 128 126 C 120 140, 120 172, 126 190 L 194 190 C 200 172, 200 140, 192 126 C 180 118, 140 118, 128 126 Z" fill={fur.body} />
    <ellipse cx="160" cy="162" rx="22" ry="24" fill={fur.belly} stroke="none" />
    <Both>
      <path d="M 130 130 C 116 140, 106 160, 104 178 C 103 186, 114 190, 118 182 C 122 168, 128 156, 136 148 Z" fill={limbs} />
      <circle cx="110" cy="185" r="9" fill={limbs} />
    </Both>
  </>;
}

type Piece = { art: ReactNode; behindHead?: ReactNode };

const sleeve = (color: string, long: boolean) => long
  ? <path d="M 129 127 C 115 139, 105 160, 102 177 L 119 182 C 123 168, 129 156, 137 147 Z" fill={color} />
  : <path d="M 128 126 C 117 134, 109 146, 105 158 L 121 165 C 125 156, 130 149, 137 143 Z" fill={color} />;
const torso = (color: string) =>
  <path d="M 126 123 C 117 140, 117 172, 123 193 L 197 193 C 203 172, 203 140, 194 123 C 180 115, 140 115, 126 123 Z" fill={color} />;

export const TOPS: Record<string, Piece> = {
  tee: { art: <>
    <Both>{sleeve('#ffffff', false)}</Both>{torso('#ffffff')}
    <path d="M 146 120 Q 160 132 174 120" fill="none" />
    <path d="M 150 148 L 170 148 L 166 168 L 154 168 Z" fill="#e0617f" stroke="none" />
  </> },
  hoodie: { behindHead: <path d="M 126 128 C 118 104, 202 104, 194 128 Z" fill="#7a63c9" />, art: <>
    <Both>{sleeve('#8f7ad6', true)}<rect x="101" y="173" width="19" height="9" rx="3" transform="rotate(14 110 177)" fill="#7a63c9" /></Both>
    {torso('#8f7ad6')}
    <path d="M 140 168 L 180 168 L 186 188 L 134 188 Z" fill="#7a63c9" />
    <path d="M 152 124 L 150 146 M 168 124 L 170 146" fill="none" stroke={CREAM} strokeWidth="2.5" strokeLinecap="round" />
  </> },
  shirt: { art: <>
    <Both>{sleeve('#dbe9f7', true)}<rect x="101" y="173" width="19" height="8" rx="2" transform="rotate(14 110 177)" fill="#ffffff" /></Both>
    {torso('#dbe9f7')}
    <Both><path d="M 160 122 L 142 118 L 146 136 Z" fill="#ffffff" /></Both>
    <path d="M 160 124 L 160 192" fill="none" strokeWidth="1.5" />
    {[140, 156, 172].map((y) => <circle key={y} cx="160" cy={y} r="2" fill={INK} stroke="none" />)}
  </> },
  sweater: { art: <>
    <Both>{sleeve('#4f8a6b', true)}</Both>{torso('#4f8a6b')}
    <path d="M 122 150 C 140 156, 180 156, 198 150 L 199 162 C 180 168, 140 168, 121 162 Z" fill="#f2d48a" stroke="none" />
    <path d="M 124 186 L 196 186" fill="none" strokeWidth="5" stroke="#3d6e55" />
    <path d="M 144 120 Q 160 130 176 120" fill="none" strokeWidth="5" stroke="#3d6e55" />
  </> },
  jacket: { art: <>
    {torso('#ffffff')}
    <Both>{sleeve('#5a7fa6', true)}<path d="M 126 123 C 117 140, 117 172, 123 193 L 154 193 L 152 124 C 140 118, 132 119, 126 123 Z" fill="#5a7fa6" />
      <rect x="130" y="146" width="14" height="10" rx="2" fill="#4a6882" /></Both>
  </> },
  dress: { art: <>
    <Both><path d="M 128 126 C 120 132, 115 140, 112 148 L 124 154 C 127 147, 131 141, 137 137 Z" fill="#f2a7c0" /></Both>
    <path d="M 128 122 C 140 116, 180 116, 192 122 L 194 182 L 214 236 L 106 236 L 126 182 Z" fill="#f2a7c0" />
    <path d="M 126 182 L 194 182" fill="none" strokeWidth="5" stroke="#d7799a" />
    {[128, 148, 168, 188].map((x) => <circle key={x} cx={x + 4} cy="212" r="3" fill={CREAM} stroke="none" />)}
  </> },
};

export const BOTTOMS: Record<string, Piece> = {
  jeans: { art: <>
    <path d="M 130 184 L 190 184 L 190 256 L 164 256 L 161 204 L 159 204 L 156 256 L 130 256 Z" fill="#4a6882" />
    <path d="M 137 196 L 137 252 M 183 196 L 183 252" fill="none" stroke="#354f67" strokeWidth="1.8" />
  </> },
  shorts: { art: <>
    <path d="M 129 184 L 191 184 L 193 222 L 164 222 L 160 204 L 156 222 L 127 222 Z" fill="#c9a66b" />
    <path d="M 160 186 L 160 202" fill="none" strokeWidth="1.5" />
  </> },
  skirt: { art: <>
    <path d="M 128 182 L 192 182 L 206 230 L 114 230 Z" fill="#771e35" />
    <path d="M 146 184 L 140 230 M 160 184 L 160 230 M 174 184 L 180 230" fill="none" stroke="#5e1528" strokeWidth="2" />
  </> },
  joggers: { art: <>
    <path d="M 130 184 L 190 184 L 189 248 L 165 248 L 161 204 L 159 204 L 155 248 L 131 248 Z" fill="#6f6a75" />
    <Both><rect x="131" y="246" width="25" height="9" rx="3" fill="#57525c" /></Both>
    <Both><path d="M 140 190 L 140 240" fill="none" stroke={CREAM} strokeWidth="2.5" /></Both>
  </> },
};

export const SHOES: Record<string, Piece> = {
  sneakers: { art: <Both>
    <path d="M 128 266 C 128 258, 140 254, 154 256 C 162 258, 164 264, 164 270 L 126 270 Z" fill="#ffffff" />
    <path d="M 124 270 L 166 270 C 168 275, 165 280, 160 280 L 128 280 C 123 280, 121 275, 124 270 Z" fill="#e0617f" />
    <path d="M 140 260 L 148 264" fill="none" strokeWidth="2" strokeLinecap="round" />
  </Both> },
  boots: { art: <Both>
    <path d="M 132 236 L 158 236 L 158 266 L 166 270 C 168 276, 164 280, 158 280 L 130 280 C 126 280, 126 274, 130 270 Z" fill="#7a4a2a" />
    <path d="M 132 244 L 158 244" fill="none" stroke="#5c3720" strokeWidth="3" />
  </Both> },
  loafers: { art: <Both>
    <path d="M 128 268 C 128 260, 140 258, 152 259 C 160 260, 165 266, 165 272 C 165 278, 158 280, 150 280 L 132 280 C 126 280, 126 272, 128 268 Z" fill="#2c2629" />
    <path d="M 138 264 L 154 264" fill="none" stroke="#e7b347" strokeWidth="2.5" strokeLinecap="round" />
  </Both> },
  sandals: { art: <Both>
    <path d="M 126 276 L 166 276 C 168 280, 164 283, 160 283 L 130 283 C 125 283, 124 279, 126 276 Z" fill="#c9a66b" />
    <path d="M 132 270 C 140 262, 152 262, 160 270" fill="none" stroke="#e0617f" strokeWidth="5" strokeLinecap="round" />
  </Both> },
};

const image = (name: string) => <image href={`/illustrations/parts/${name}.svg`} x="0" y="0" width="320" height="320" />;

/** Màu lông của 6 con vẽ sẵn, để thân dáng chung khớp với cái đầu gốc. */
const DRAWN_FUR: Record<Exclude<MascotId, ModularId>, Fur> = {
  cat: { body: '#fbf3ea', belly: CREAM },
  fox: { body: '#cf5c2e', belly: CREAM },
  rabbit: { body: CREAM, belly: '#f5dce1' },
  bear: { body: '#8e5a38', belly: '#fae8d7' },
  frog: { body: '#648653', belly: '#edf3e4' },
  penguin: { body: '#2c2629', belly: CREAM },
};

/**
 * Con tự phối: đầu vẽ trong code. Con vẽ sẵn: lấy đúng cái đầu (và đuôi cáo) từ hình gốc, đặt lên dáng chung để
 * thay được bộ đồ vẽ sẵn. Ếch đội mũ khác thì dùng đầu không mũ nồi.
 */
function figureFor(id: MascotId, hat?: string): Figure {
  if (isModular(id)) return HEADS[id];
  return {
    fur: DRAWN_FUR[id],
    back: id === 'fox' ? image('fox-tail') : undefined,
    head: image(id === 'frog' && hat ? 'frog-head-bare' : `${id}-head`),
  };
}

/** Vẽ linh vật mặc đồ; children = mũ, kính, phụ kiện cổ (vẽ đè lên đầu). */
export function ModularMascot({ id, hat, top, bottom, shoes, children }:
  { id: MascotId; hat?: string; top?: string; bottom?: string; shoes?: string; children?: ReactNode }) {
  const animal = figureFor(id, hat);
  const shirt = top ? TOPS[top] : undefined;
  return (
    <g stroke={INK} strokeWidth="2.6" strokeLinejoin="round">
      <ellipse cx="160" cy="284" rx="56" ry="6" fill="#f5dce1" stroke="none" />
      {animal.back}
      <Body fur={animal.fur} />
      {bottom && BOTTOMS[bottom]?.art}
      {shoes && SHOES[shoes]?.art}
      {shirt?.art}
      {shirt?.behindHead}
      {animal.head}
      {children}
    </g>
  );
}
