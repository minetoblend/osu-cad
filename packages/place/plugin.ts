import type { Plugin } from 'vite';
import crypto from 'node:crypto';
import * as acorn from 'acorn';
import { walk } from 'estree-walker';
import MagicString from 'magic-string';

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
