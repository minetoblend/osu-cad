import type { Plugin } from 'vite';
import crypto from 'node:crypto';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import * as acorn from 'acorn';
import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // @ts-expect-error this works
    nxViteTsPaths(),
    privatePropertyOptimizer(),
  ],
  esbuild: {
    target: 'chrome113',
  },
  worker: {
    format: 'es',
    // @ts-expect-error this works
    plugins: () => [nxViteTsPaths()],
  },
  build: {
    emptyOutDir: true,
    reportCompressedSize: true,
    target: 'esnext',
    minify: false,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true,
      },
      '/preview': {
        target: 'https://catboy.best',
        changeOrigin: true,
      },
      '/beatmaps': {
        target: 'https://assets.ppy.sh',
        changeOrigin: true,
      },
    },
  },
});

export function privatePropertyOptimizer(keepNames = false): Plugin {
  const mangledNames = new Set<string>();

  return {
    enforce: 'post',
    name: 'private-property-optimizer',
    transform(code, id) {
      if (!code.includes('#'))
        return;

      const s = new MagicString(code);

      const ast = acorn.parse(s.original, {
        ecmaVersion: 'latest',
        sourceType: 'module',
        locations: true,
        ranges: true,
      });

      const lookupMap = new Map<string, string>();

      const generateMangledName = (name: string) => {
        const shasum = crypto.createHash('sha1');
        shasum.update(`${id}_${name}`);
        const hash = shasum.digest('hex');

        const mangled = keepNames
          ? `${name}_${hash.slice(0, 6)}`
          : `_${hash.slice(0, 6)}`;

        mangledNames.add(mangled);
        lookupMap.set(name, mangled);

        return mangled;
      };

      walk(ast, {
        enter(node) {
          if (node.type === 'PropertyDefinition' && node.key.type === 'PrivateIdentifier')
            generateMangledName(node.key.name);

          if (node.type === 'MethodDefinition' && node.key.type === 'PrivateIdentifier')
            generateMangledName(node.key.name);
        },
      });

      if (lookupMap.size === 0)
        return;

      walk(ast, {
        enter(node) {
          if (node.type === 'PropertyDefinition' && node.key.type === 'PrivateIdentifier') {
            const mangled = lookupMap.get(node.key.name);
            if (mangled)
              s.update(node.key.range[0], node.key.range[1], mangled);
          }

          if (node.type === 'MethodDefinition' && node.key.type === 'PrivateIdentifier') {
            const mangled = lookupMap.get(node.key.name);

            if (mangled)
              s.update(node.key.range[0], node.key.range[1], mangled);
          }

          if (node.type === 'MemberExpression' && node.property.type === 'PrivateIdentifier') {
            const mangled = lookupMap.get(node.property.name);

            if (mangled)
              s.update(node.property.range[0], node.property.range[1], mangled);
          }
        },
      });

      return {
        code: s.toString(),
        map: s.generateMap(),
      };
    },
  };
}
