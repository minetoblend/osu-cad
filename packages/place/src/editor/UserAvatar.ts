import type { DrawableOptions } from '@osucad/framework';
import type { Texture } from 'pixi.js';
import { Axes, Bindable, BindableBoolean, Box, CircularContainer, DrawableSprite, FillMode, loadTexture, Vec2 } from '@osucad/framework';

const avatarCache = new Map<number, Promise<Texture | null>>();

export class UserAvatar extends CircularContainer {
  readonly userId = new Bindable<number | null>(null);

  constructor(options: DrawableOptions = {}) {
    super();

    this.masking = true;
    this.size = new Vec2(24);

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0.15,
      }),
    ];

    this.with(options);
  }

  #avatar?: DrawableSprite;

  protected loadComplete() {
    super.loadComplete();

    this.userId.bindValueChanged(id => this.loadAvatar(id.value), true);
  }

  readonly loading = new BindableBoolean(false);

  async loadAvatar(id: number | null) {
    if (id === null) {
      this.#avatar?.expire();
      this.#avatar = undefined;
      this.loading.value = false;
      return;
    }

    this.loading.value = true;

    let texture: Texture | null;
    if (avatarCache.has(id)) {
      texture = await avatarCache.get(id)!;
    }
    else {
      const textureP = loadTexture(`/api/users/${id}/avatar`);
      avatarCache.set(id, textureP);

      texture = await textureP;
    }

    if (id !== this.userId.value)
      return;

    this.loading.value = false;

    if (!texture)
      return;

    this.addInternal(this.#avatar = new DrawableSprite({
      texture,
      relativeSizeAxes: Axes.Both,
      fillMode: FillMode.Fill,
    }));
  }
}
