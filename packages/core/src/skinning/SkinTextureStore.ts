import type { ComputedRef } from "@osucad/framework";
import { Action, computed, DrawableSprite, type IFile, loadTexture, reactive, unref, watch } from "@osucad/framework";
import { computedAsync } from "@vueuse/core";
import { deferredPromise } from "../utils/DeferredPromise";
import type { Texture } from "pixi.js";
import type { Skin } from "./Skin";
import { SkinnableTextureAnimation } from "./SkinnableTextureAnimation";

export interface TextureStoreManifestRaw
{
  readonly textures?: (TextureManifestEntry | string)[];
  readonly animations?: (AnimationManifestEntry | string)[];
}

export interface TextureStoreManifest
{
  readonly textures: TextureManifestEntry[];
  readonly animations: AnimationManifestEntry[];
}

export interface TextureManifestEntry
{
  readonly name: string;
}

export interface AnimationManifestEntry
{
  name: string;
  animatable?: boolean
  animationSeparator?: string
  looping?: boolean
  applyConfigFrameRate?: boolean
  startAtCurrentTime?: boolean,
  frameLength?: number,
  maxSize?: number
}

interface ReactiveFileEntry
{
  file: IFile;
  version: number;
}

export class SkinTextureStore
{
  readonly textureChanged = new Action();

  allow2xTextureLookup = true;

  constructor(
    readonly skin: Skin,
    manifest: TextureStoreManifestRaw | ComputedRef<TextureStoreManifestRaw>,
  )
  {
    for (const file of skin.files.entries())
      this._addFile(file);

    skin.files.on("added", (_, file) => this._addFile(file));

    this.manifest = computed(() =>
    {
      return {
        textures: unref(manifest).textures?.map(entry => normalizeTextureManifestEntry(entry)) ?? [],
        animations: unref(manifest).animations?.map(entry => normalizeAnimationManifestEntry(entry)) ?? [],
      };
    });

    this._textures = this.manifest.value.textures.map(entry => new ReactiveTextureEntry(this, normalizeTextureManifestEntry(entry)));
    this._animations = this.manifest.value.animations.map(entry => new ReactiveAnimationEntry(this, entry));

    watch(this.manifest, (newManifest: TextureStoreManifest) =>
    {
      const textures = [...this._textures];
      const animations = [...this._animations];

      // find removed entries
      for (const entry of textures)
      {
        if (newManifest.textures.some(it => it.name === entry.manifest.name))
          continue;

        this._textures.splice(this._textures.indexOf(entry), 1);
      }

      for (const entry of animations)
      {
        if (newManifest.animations.some(it => it.name === entry.manifest.name))
          continue;

        this._animations.splice(this._animations.indexOf(entry), 1);
      }

      // find new entries
      for (const entry of newManifest.textures)
      {
        if (this._textures.some(it => it.manifest.name === entry.name))
          continue;

        this._textures.push(new ReactiveTextureEntry(this, entry));
      }

      for (const entry of newManifest.animations)
      {
        if (this._animations.some(it => it.manifest.name === entry.name))
          continue;

        this._animations.push(new ReactiveAnimationEntry(this, entry));
      }
    });
  }

  readonly manifest: ComputedRef<TextureStoreManifest>;

  private _counter = 0;

  private _addFile(file: IFile)
  {
    this.filesReactive.push({ file, version: this._counter++ });

    const remove = () =>
    {
      const index = this.filesReactive.findIndex(it => it.file === file);
      if (index >= 0)
        this.filesReactive.splice(index, 1);
    };

    file.once("removed", remove);

    file.once("changed", () =>
    {
      remove();
      setTimeout(() => this._addFile(file), 0);
    });
  }

  async load()
  {
    await Promise.all([
      ...this._textures.map(entry => entry.load()),
      ...this._animations.map(entry => entry.load()),
    ]);

    watch(() => this.skin.getConfig("animationFramerate"), () =>
    {
      this.textureChanged.emit();
    });
  }

  readonly filesReactive = reactive<ReactiveFileEntry[]>([]);

  private readonly _textures: ReactiveTextureEntry[];
  private readonly _animations: ReactiveAnimationEntry[];

  readonly extensions: string[] = ["jpg", "jpeg", "png", "webp"];

  getEntry(name: string)
  {
    const lookupNames = this.allow2xTextureLookup ? [`${name}@2x`, name] : name;

    for (const lookup of lookupNames)
    {
      for (const entry of this.filesReactive)
      {
        for (const extension of this.extensions)
        {
          if (entry.file.path === `${lookup}.${extension}`)
            return entry;
        }
      }
    }

    return null;
  }

  getTexture(name: string)
  {
    const entry = this._textures.find(it => it.manifest.name === name);

    return entry?.texture.value ?? null;
  }

  getAnimation(name: string)
  {
    const entry = this._animations.find(it => it.manifest.name === name);
    if (!entry)
      return null;

    return entry.getAnimation();
  }
}

class ReactiveTextureEntry
{
  constructor(
    readonly store: SkinTextureStore,
    readonly manifest: TextureManifestEntry,
  )
  {
  }

  readonly entry = computed(() => this.store.getEntry(this.manifest.name));

  readonly texture = computedAsync(async () =>
  {
    try
    {
      const entry = this.entry.value;

      if (!entry)
        return null;

      const data = await entry.file.read();

      const is2xTexture = entry.file.path.includes("@2x");

      return await loadTexture(data, { resolution: is2xTexture ? 2 : 1, label: entry.file.path });
    }
    finally
    {
      setTimeout(() => this.isLoaded.resolve(), 0);
    }
  }, null, { lazy: false });

  isLoaded = deferredPromise<void>();

  async load()
  {
    await this.isLoaded;

    watch(this.texture, () =>
    {
      this.store.textureChanged.emit();
    });
  }
}

export function normalizeTextureManifestEntry(value: TextureManifestEntry | string): TextureManifestEntry
{
  if (typeof value === "string")
    return { name: value };
  return value;
}

export function normalizeAnimationManifestEntry(value: AnimationManifestEntry | string): AnimationManifestEntry
{
  if (typeof value === "string")
    return { name: value };
  return value;
}


class ReactiveAnimationEntry
{
  constructor(
    readonly store: SkinTextureStore,
    readonly manifest: AnimationManifestEntry,
  )
  {
  }

  entries = computed(() =>
  {
    const {
      animationSeparator = "-",
      name: componentName,
    } = this.manifest;

    const getFrameName = (frameIndex: number) => `${componentName}${animationSeparator}${frameIndex}`;

    const entries: ReactiveFileEntry[] = [];

    let frameCount = 0;
    while (true)
    {
      const entry = this.store.getEntry(getFrameName(frameCount));

      if (!entry)
        break;

      entries.push(entry);

      frameCount++;
    }

    if (entries.length === 0)
    {
      const entry = this.store.getEntry(this.manifest.name);
      if (entry)
        return [entry];
    }

    return entries;
  });

  readonly textures = computedAsync(async () =>
  {
    try
    {
      const entries = this.entries.value;

      const textures = await Promise.all(entries.map(entry => this.#loadTexture(entry)));

      return textures.filter(it => it !== null) as Texture[];
    }
    finally
    {
      setTimeout(() => this.isLoaded.resolve(), 0);
    }
  }, [], { lazy: false });

  async #loadTexture(entry: ReactiveFileEntry)
  {
    const data = await entry.file.read();

    return loadTexture(data);
  }

  isLoaded = deferredPromise<void>();

  async load()
  {
    await this.isLoaded;

    watch(this.textures, () =>
    {
      this.store.textureChanged.emit();
    });
  }

  getAnimation()
  {
    const {
      looping = false,
      applyConfigFrameRate = false,
      startAtCurrentTime = true,
      frameLength,
    } = this.manifest;

    const textures = this.textures.value;

    if (textures.length === 0)
      return null;

    if (textures.length === 1)
      return new DrawableSprite({ texture: textures[0] });

    const animation = new SkinnableTextureAnimation(startAtCurrentTime);
    animation.loop = looping;
    animation.defaultFrameLength = frameLength ?? this.#getFrameLength(applyConfigFrameRate, textures);

    for (const t of textures)
      animation.addFrame(t);

    return animation;
  }

  #getFrameLength(applyConfigFrameRate: boolean, textures: Texture[])
  {
    if (applyConfigFrameRate)
    {
      const iniRate = this.store.skin.getConfig("animationFramerate");

      if (iniRate && iniRate > 0)
        return 1000 / iniRate;

      return 1000 / textures.length;
    }

    return 1000 / 60;
  }
}
