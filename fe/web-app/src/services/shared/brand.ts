import brand from '../../../brand.json';

export { brand };

// Web contrast tokens. The shared brand manifest also feeds the mobile app.
export const webColors = {
  ...brand.colors,
  purple: '#6b2bb8',
  purpleDark: '#542090',
  muted: '#5c5265',
  green: '#21674e',
  amber: '#805019',
  pink: '#9e3655',
  accentRose: '#a43161',
  accentGold: '#8c5a28',
};

/** Áp dụng manifest chung trước khi React render để CSS và Ant Design dùng cùng token. */
export function applyBrandToDocument() {
  const root = document.documentElement;
  const cssColors: Record<string, keyof typeof webColors> = {
    purple: 'purple', 'purple-dark': 'purpleDark', pink: 'pink', lavender: 'lavender',
    'lav-soft': 'lavSoft', bg: 'bg', surface: 'surface', ink: 'ink', muted: 'muted',
    line: 'line', green: 'green', 'green-soft': 'greenSoft', amber: 'amber',
    'amber-soft': 'amberSoft', 'pink-soft': 'pinkSoft', 'on-accent': 'white',
    'accent-rose': 'accentRose', 'accent-gold': 'accentGold',
  };
  for (const [cssName, key] of Object.entries(cssColors)) {
    root.style.setProperty(`--${cssName}`, webColors[key]);
  }
  root.style.setProperty('--font-head', `'${brand.typography.head}', 'Segoe UI', system-ui, sans-serif`);
  root.style.setProperty('--font-body', `'${brand.typography.body}', 'Segoe UI', system-ui, sans-serif`);
  for (const size of brand.typography.sizes) root.style.setProperty(`--type-${size}`, `${size}px`);
  for (const [name, weight] of Object.entries(brand.typography.weights)) {
    root.style.setProperty(`--weight-${name}`, String(weight));
  }
  for (const [name, value] of Object.entries(brand.radius)) root.style.setProperty(`--r-${name}`, `${value}px`);
  root.style.setProperty('--asset-quick-pick', `url('${brand.assets.quickPick}')`);
  root.style.setProperty('--asset-auth-wall', `url('${brand.assets.authWall}')`);
}
