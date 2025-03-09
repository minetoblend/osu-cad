import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    semi: true,
  },
  typescript: {
    overrides: {
      'no-console': 'off',
      'unused-imports/no-unused-vars': 'off',
      'no-lone-blocks': 'off',
      'ts/no-require-imports': 'off',
      'ts/prefer-literal-enum-member': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'ts/no-use-before-define': 'off',
      'ts/no-this-alias': 'off',
      'ts/method-signature-style': 'off',
      'unicorn/no-new-buffer': 'off',
    },
  },
});
