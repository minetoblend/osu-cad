import { Axes, Bindable, BindableBoolean, Box, CircularContainer, DrawableSprite, FillMode, loadTexture, Vec2 } from '@osucad/framework';

export class UserAvatar extends CircularContainer {
  readonly userId = new Bindable<number | null>(null);

  constructor() {
    super();

    this.masking = true;
    this.size = new Vec2(24);

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0.15,
      }),
    ];
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

    const texture = await loadTexture(`/api/users/${id}/avatar`);

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
