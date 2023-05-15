import { Plugin } from "vite";
import { MagicString } from "vue/compiler-sfc";

// vite plugin that will auto-import texures from urls

export function PixiPlugin(): Plugin {
  return {
    name: "pixi-plugin",
    async transform(code, id) {
      if (!id.endsWith(".vue")) return;

      const s = new MagicString(code);

      const searchString = "texture=";

      let index = code.indexOf(searchString);

      const importedTextures = new Map<string, string>();

      let count = 0;

      while (index !== -1) {
        if (code.charAt(index - 1) !== ":") {
          const stringEnd = code.indexOf('"', index + searchString.length + 2);

          const module = code.slice(index + searchString.length + 1, stringEnd);

          const resolved = await this.resolve(module, id);

          if (resolved) {
            let name = `__pixiTexture${count++}`;
            if (importedTextures.has(resolved.id))
              name = importedTextures.get(name);

            importedTextures.set(resolved.id, name);

            s.prependLeft(index, ":");
            s.overwrite(index + searchString.length + 1, stringEnd, name);
          }
        }

        index = code.indexOf(searchString, index + 1);
      }

      if (count > 0) {
        const scriptSetupIndex = code.indexOf("<script setup");
        if (scriptSetupIndex === -1) return;
        const scriptSetupEndIndex = code.indexOf(">", scriptSetupIndex);
        if (scriptSetupEndIndex === -1) return;

        s.prependLeft(scriptSetupEndIndex + 1, "\n/* pixi texture imports */");
        importedTextures.forEach((name, module) => {
          s.prependLeft(
            scriptSetupEndIndex + 1,
            `\nimport ${name} from "${module}?texture";`
          );
        });

        return {
          code: s.toString(),
          map: s.generateMap({ includeContent: true }),
        };
      }
    },
    enforce: "pre",
    resolveId(id) {},
    load(id, options) {
      // console.log(id)

      if (id.endsWith("?texture")) {
        const url = new URL(id);
        url.searchParams.delete("texture");

        return [
          `import texturePath from "${url}";`,
          `import { Texture } from "pixi.js";`,
          `export default Texture.from(texturePath)`,
        ].join("\n");
      }
    },
  };
}
