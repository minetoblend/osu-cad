import { resolve, relative, dirname } from "path";
import type { Plugin, ResolvedConfig } from "vite";
import { normalizePath } from "vite";

const testBrowserModule = "virtual:test-browser";
const resolvedTestBrowserModule = `\0${testBrowserModule}`;

export function visualTests(): Plugin
{
  let resolvedConfig: ResolvedConfig = undefined!;

  return {
    name: "@osucad/test-browser",
    enforce: "pre",
    apply: "serve",
    configResolved: config =>
    {
      resolvedConfig = config;
    },
    resolveId: (id, importer) =>
    {
      const { path } = parseId(id);

      if (path === testBrowserModule && importer)
        return resolvedTestBrowserModule + `?path=${encodeURIComponent(importer)}`;

      return null;
    },
    load(id)
    {
      const { path, query } = parseId(id);

      if (path === resolvedTestBrowserModule)
      {
        const directory = dirname(query.path);

        const glob = normalizePath(
            "/" +
            relative(
                resolvedConfig.root,
                resolve(directory, "./**/*.testscene.ts"),
            ),
        );

        return {
          code: `
          import { Bindable } from "@osucad/framework";
          import { TestBrowser } from "@osucad/visual-tests";
          
          export const tests = new Bindable(import.meta.glob("${glob}", {
            query: "testscene",
            eager: false,
          }));
          
          export function createTestBrowser() {
            return new TestBrowser(tests)
          }
          
          if (import.meta.hot) {
            import.meta.hot.accept((newModule) =>
            {
              tests.value = newModule.tests.value;
            });
          }
          `,
        };
      }

      if (!("testscene" in query))
        return;

      return {
        code: `
        import scene from "${path}";
        import { Bindable } from '@osucad/framework';
        
        const testScene = {
          scene: new Bindable(scene),
        };
        
        export default testScene;
        
        if (import.meta.hot) {
          import.meta.hot.accept("${path}", newModule => {
            testScene.scene.value = newModule.default;
          });
        }
        `,
      };
    },
  };
}

function parseId (id: string)
{
  const index = id.indexOf("?");
  if (index < 0)
    return { path: id, query: {} };

  const query = Object.fromEntries(new URLSearchParams(id.slice(index)));
  return { path: id.slice(0, index), query };
}
