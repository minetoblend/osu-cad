import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    semi: true,
  },
  typescript: {
    overrides: {
      'no-console': 'off',
    },
  },
})
