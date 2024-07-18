import { CompositeDrawable, loadTexture } from 'osucad-framework';
import type { Texture } from 'pixi.js';

export class UserAvatarCache extends CompositeDrawable {
  cache = new Map<number, Promise<Texture | null>>();

  async getAvatar(userId: number) {
    if (!this.cache.has(userId)) {
      const promise = loadTexture(
        `/api/users/${userId}/avatar`,
        {
          autoGarbageCollect: true,
        },
      ).then((texture) => {
        if (texture) {
          const destroy = texture.destroy.bind(texture);

          (texture as any).refcount = 0;

          texture.destroy = () => {
            (texture as any).refcount--;

            if ((texture as any).refcount === 0) {
              destroy();
            }
          };
        }

        return texture;
      });

      promise.then((texture: Texture | null) => {
        if (texture) {
          texture.once('destroy', () => {
            this.cache.delete(userId);
          });
        }
      });

      this.cache.set(userId, promise);
    }

    const texture = this.cache.get(userId)!;

    return texture.then((texture) => {
      if (texture) {
        (texture as any).refcount++;
      }

      return texture;
    });
  }
}
