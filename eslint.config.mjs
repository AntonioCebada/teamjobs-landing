export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'error',
    },
  },
];
