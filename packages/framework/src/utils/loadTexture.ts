import type { LoadImageBitmapOptions } from './WorkerManager.ts';
import { ImageSource, path, Texture, type TextureSourceOptions } from 'pixi.js';
import { WorkerManager } from './WorkerManager.ts';

export async function loadTexture(src: string | ArrayBuffer, options: TextureSourceOptions = {}, opts2: LoadImageBitmapOptions = {}): Promise<Texture | null> {
  try {
    if (typeof  src === 'string')
      src = path.toAbsolute(src);

    const imageBitmap = await WorkerManager.loadImageBitmap(src, undefined, opts2);

    const source = new ImageSource({
      resource: imageBitmap,
      alphaMode: 'premultiply-alpha-on-upload',
      label: typeof src === 'string' ? src : undefined,
      resolution: 1,
      ...options,
    });

    source.once('destroy', () => imageBitmap.close());

    return new Texture({
      source,
      label: typeof src === 'string' ? src : undefined,
    });
  }
  catch (error) {
    console.error('Failed to load texture', src, error);
    return null;
  }
}