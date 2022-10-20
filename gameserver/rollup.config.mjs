import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';

const extensions = ['.mjs', '.js', '.ts', '.json'];

export default {
    input: './src/main.ts',
    external: ['nakama-runtime'],
    plugins: [
        // Allows node_modules resolution
        resolve({ extensions }),

        // Compile TypeScript
        typescript(),

        json(),

        // Resolve CommonJS modules
        commonJS({ extensions }),

        // Transpile to ES5
        babel({
            extensions,
            babelHelpers: 'bundled',
        }),
    ],
    output: {
        file: 'build/index.js',
    },
};