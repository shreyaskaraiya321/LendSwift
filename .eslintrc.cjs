module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: [
    'react',
    'react-hooks',
    'react-refresh',
    'jsx-a11y',
    'simple-import-sort',
    'promise',
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:promise/recommended',
  ],
  rules: {
    // React Hooks Rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // React Refresh for Vite
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    // Clean Code Constraints - Unused Variables
    'no-unused-vars': 'off', // turned off in favor of @typescript-eslint rule
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // Clean Code Constraints - Unhandled Promises
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
    'promise/catch-or-return': 'error',
    'promise/always-return': ['error', { ignoreLastCallback: true }],

    // Import Sorting (Strict group ordering)
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Packages `react` related packages come first
          ['^react', '^@?\\w'],
          // Internal alias imports (`@/...`)
          ['^@(/.*|$)'],
          // Parent imports. Put `..` last.
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // Other relative imports. Put same-folder imports and `.` last.
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Style imports.
          ['^.+\\.?(css)$'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',

    // Accessibility (a11y) Constraints
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        assert: 'either',
        depth: 3,
      },
    ],

    // React clean practices
    'react/prop-types': 'off', // TypeScript handles prop types
    'react/react-in-jsx-scope': 'off',
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    '*.config.js',
    '*.config.cjs',
    '*.d.ts',
    'vite.config.ts',
    '.eslintrc.cjs',
  ],
};
