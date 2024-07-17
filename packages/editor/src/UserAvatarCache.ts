import { CompositeDrawable } from 'osucad-framework';
import type { Texture, TextureSourceOptions } from 'pixi.js';
import { Assets } from 'pixi.js';

export class UserAvatarCache extends CompositeDrawable {
  cache = new Map<number, Promise<Texture | null>>();

  async getAvatar(userId: number) {
    if (!this.cache.has(userId)) {
      const promise = Assets.load({
        src: `/api/users/${userId}/avatar`,
        loadParser: 'loadTextures',
        data: {
          autoGarbageCollect: true,
        } as Partial<TextureSourceOptions>,
      });

      promise.then((texture: Texture) => {
        if (texture) {
          texture.once('destroy', () => {
            this.cache.delete(userId);
          });
        }
      });

      this.cache.set(userId, promise);
    }

    return this.cache.get(userId)!;
  }
}
