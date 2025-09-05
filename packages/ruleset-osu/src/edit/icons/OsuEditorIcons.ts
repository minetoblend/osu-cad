import { loadTexture } from "@osucad/framework";

export class OsuEditorIcons
{

}

export namespace OsuEditorIcons
{
  export async function create()
  {
    const textures = {
      select: loadTexture(new URL("", import.meta.url).href),
    };


  }
}
