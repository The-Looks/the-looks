import brand from '../../../brand.json';

export { brand };

/** Áp dụng manifest chung trước khi React render để CSS và Ant Design dùng cùng token. */
export function applyBrandToDocument() {
  const root = document.documentElement;
  const cssColors: Record<string, keyof typeof brand.colors> = {
    purple: 'purple', 'purple-dark': 'purpleDark', pink: 'pink', lavender: 'lavender',
    'lav-soft': 'lavSoft', bg: 'bg', surface: 'surface', ink: 'ink', muted: 'muted',
    line: 'line', green: 'green', 'green-soft': 'greenSoft', amber: 'amber',
    'amber-soft': 'amberSoft', 'pink-soft': 'pinkSoft', 'on-accent': 'white',
  };
  for (const [cssName, key] of Object.entries(cssColors)) {
    root.style.setProperty(`--${cssName}`, brand.colors[key]);
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

  const fontFaces = [
    [brand.typography.head, 600, brand.typography.files.head600],
    [brand.typography.head, 700, brand.typography.files.head700],
    [brand.typography.head, 800, brand.typography.files.head800],
    [brand.typography.body, 400, brand.typography.files.body400],
    [brand.typography.body, 500, brand.typography.files.body500],
    [brand.typography.body, 600, brand.typography.files.body600],
    [brand.typography.body, 700, brand.typography.files.body700],
  ] as const;
  const style = document.createElement('style');
  style.dataset.brandFonts = 'true';
  style.textContent = fontFaces.map(([family, weight, file]) =>
    `@font-face { font-family: '${family}'; src: url('${file}') format('truetype'); font-style: normal; font-weight: ${weight}; font-display: swap; }`,
  ).join('\n');
  document.head.appendChild(style);
}
