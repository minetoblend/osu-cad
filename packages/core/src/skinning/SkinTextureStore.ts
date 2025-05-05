import type { IFile, IFileSystem, IVec2 } from "@osucad/framework";
import { loadTexture } from "@osucad/framework";
import type { Texture } from "pixi.js";

export interface LoadTextureOptions
{
  maxSize?: IVec2
}

export class SkinTextureStore
{
  private readonly extensions = ["jpg", "jpeg", "png", "webp"];

  private readonly textures = new Map<string, Texture>();
  private readonly textureP = new Map<string, Promise<Texture | undefined>>();

  constructor(readonly files: IFileSystem)
  {
  }

  allow2xLookup = true;

  private getEntry(name: string): { file: IFile, resolution: number } | undefined
  {
    name = name.trim().toLowerCase();

    const lookups = [{ name, resolution: 1 }];

    if (this.allow2xLookup)
    {
      lookups.unshift({ name: name + "@2x", resolution: 2 });
    }

    for (const lookup of lookups)
    {
      for (const extension of this.extensions)
      {
        const file = this.files.get(`${lookup.name}.${extension}`);
        if (file)
          return { file, resolution: lookup.resolution };
      }
    }

    return undefined;
  }

  canLoad(lookup: string): boolean
  {
    const entry = this.getEntry(lookup);
    return !!entry;
  }

  async load(lookup: string, options?: LoadTextureOptions): Promise<Texture | undefined>
  {
    if (this.textureP.has(lookup))
      return this.textureP.get(lookup)!;

    const entry = this.getEntry(lookup);
    if (!entry)
      return undefined;

    const { file, resolution } = entry;

    const textureP = file.read()
      .then(data => loadTexture(data, { resolution, label: file.path }))
      .then(texture =>
      {
        if (!texture)
          return undefined;

        this.textures.set(lookup, texture);
        return texture;
      });

    this.textureP.set(lookup, textureP);

    return await textureP;
  }

  get(lookup: string): Texture | undefined
  {
    return this.textures.get(lookup);
  }

  dispose()
  {
    for (const [, texture] of this.textures)
    {
      texture.destroy(true);
    }

    this.textures.clear();
  }

  entries()
  {
    return this.textures.keys();
  }
}
