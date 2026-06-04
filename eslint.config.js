// Root-level flat ESLint config for the OrbitTasks monorepo.
// Both apps share this base configuration.
//
// NOTE: rules are deliberately permissive in some places —
// Session 7 students will tighten them as part of the standards
// enforcement exercise.
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    files: ['apps/api/src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  // W7 step 2: lint the tests dir too (was in `ignores`), so the rule below
  // can actually fire on test files.
  {
    files: ['apps/**/tests/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Ban fire-and-forget assertions right after async actions — the
      // pattern that produced the flaky Login/Dashboard tests (W2/W5).
      // Use `await waitFor(...)` / `findBy*` instead. 'warn' on day one;
      // real teams promote to 'error' after a rollout window.
      'no-restricted-syntax': [
        'warn',
        {
          selector:
            "CallExpression[callee.name='expect'][arguments.0.type='CallExpression'][arguments.0.callee.object.name='screen']",
          message:
            'After async actions, prefer await waitFor(...) or findByText. See workshops/REMEDIATION-PLAYBOOK.md.',
        },
      ],
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', 'scripts/**'],
  },
];
