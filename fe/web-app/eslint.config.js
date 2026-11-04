import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// ADR 0005: app → pages → components/hooks → services → interface.
const boundaries = [
  { target: './src/interface', from: './src/services', message: 'DTO chỉ chứa type từ backend.' },
  { target: './src/interface', from: './src/hooks', message: 'DTO không phụ thuộc hook.' },
  { target: './src/interface', from: './src/components', message: 'DTO không phụ thuộc UI.' },
  { target: './src/interface', from: './src/pages', message: 'DTO không phụ thuộc page.' },
  { target: './src/interface', from: './src/app', message: 'DTO không phụ thuộc app.' },
  { target: './src/services', from: './src/hooks', message: 'Service không import hook.' },
  { target: './src/services', from: './src/components', message: 'Service không import component.' },
  { target: './src/services', from: './src/pages', message: 'Service không import page.' },
  { target: './src/services', from: './src/app', message: 'Service không import app.' },
  { target: './src/hooks', from: './src/components', message: 'Hook không import component.' },
  { target: './src/hooks', from: './src/pages', message: 'Hook không import page.' },
  { target: './src/hooks', from: './src/app', message: 'Hook không import app.' },
  { target: './src/components', from: './src/pages', message: 'Component không import page.' },
  { target: './src/components', from: './src/app', message: 'Component không import app.' },
  { target: './src/pages', from: './src/app', message: 'Page không import app.' },
];

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'public/mockServiceWorker.js', 'src/interface/dto/**/*.d.ts'] },
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
