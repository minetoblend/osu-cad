import esbuild from 'rollup-plugin-esbuild'

export default [
  {
    input: `src/index.ts`,
    plugins: [esbuild()],
    output: [
      {
        file: `dist/lib.cjs`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `dist/lib.esm.js`,
        format: 'es',
        sourcemap: true,
      },
    ]
  }
]
