import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

// Flat config that works with the installed ESLint 8.57 (the previous file imported
// `eslint/config`, which only exists in ESLint 9, so `npm run lint` crashed on startup).
// When the project moves to TypeScript / ESLint 9+, port the Planned_Lost config (GNR-140).
export default [
  { ignores: ['dist', '.wrangler', 'node_modules'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // core no-unused-vars cannot see JSX usage such as <motion.span>; this marks it as used
      'react/jsx-uses-vars': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true, allowExportNames: ['useAuth'] }],
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Node-side files: build configs and scripts
    files: ['*.config.js', 'scripts/**/*.mjs', 'src/**/*.test.{js,jsx}'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
]
