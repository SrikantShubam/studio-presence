import js from '@eslint/js'
import tseslint from 'typescript-eslint'

/**
 * Deliberately thin.
 *
 * The rules that matter in this codebase — nothing hardcoded, sections render
 * null when off, the service-role client never reaches a request path — are not
 * expressible as lint rules, and live in `scripts/check-*.ts` instead. ESLint is
 * here for the ordinary class of mistake that TypeScript does not catch.
 */
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      'design/**',
      'graphify-out/**',
      'docs/**',
      'inspirations/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Config comes in as `unknown` and is narrowed by Zod. Banning `any`
      // outright pushes people towards `as` casts, which are worse.
      '@typescript-eslint/no-explicit-any': 'warn',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': 'off', // the check scripts are console output
    },
  },
)
