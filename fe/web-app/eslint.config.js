import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const features = ['auth', 'wardrobe', 'outfit', 'voting', 'profile'];

// ADR 0002: phụ thuộc một chiều app → features → shared; feature không import feature khác.
const boundaries = [
  { target: './src/shared', from: './src/features', message: 'shared/ không được import features/.' },
  { target: './src/shared', from: './src/app', message: 'shared/ không được import app/.' },
  { target: './src/features', from: './src/app', message: 'features/ không được import app/.' },
  ...features.map((f) => ({
    target: `./src/features/${f}`,
    from: './src/features',
    except: [`./${f}`],
    message: 'Feature không import feature khác. Dùng chung → chuyển xuống shared/, ghép nhiều feature → làm ở app/.',
  })),
];

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'public/mockServiceWorker.js', 'src/shared/api/schema'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, import: importPlugin },
    settings: { 'import/resolver': { typescript: true, node: true } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'import/no-restricted-paths': ['error', { zones: boundaries }],
    },
  },
);
