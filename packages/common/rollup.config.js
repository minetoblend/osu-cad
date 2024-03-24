import esbuild from 'rollup-plugin-esbuild'
import { dts } from "rollup-plugin-dts";

export default [
  {
    input: `src/index.ts`,
    plugins: [esbuild()],
    external: [
      'vue'
    ],
    output: [
      {
        file: 'dist/lib.cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/lib.esm.js',
        format: 'es',
        sourcemap: true,
      }
    ]
  },
  {
    input: `src/index.ts`,
    plugins: [dts()],
    output: {
      file: 'dist/lib.d.ts',
      format: 'es'
    }
  }
]
