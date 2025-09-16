import type { Plugin } from "vite";


export function visualTests(): Plugin
{
  return {
    name: "@osucad/test-browser",
    enforce: "pre",
    load(id)
    {
      const { path, query } = parseId(id);

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
