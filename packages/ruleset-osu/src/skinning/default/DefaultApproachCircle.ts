import type { Bindable, ReadonlyDependencyContainer } from '@osucad/framework';
import type { Color } from 'pixi.js';
import { ArmedState, DrawableHitObject, ISkinSource } from '@osucad/core';
import { Anchor, Axes, CompositeDrawable, DrawableSprite, resolved, Vec2 } from '@osucad/framework';

export class DefaultApproachCircle extends CompositeDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(ISkinSource)
  private skin!: ISkinSource;

  private accentColor!: Bindable<Color>;

  @resolved(DrawableHitObject)
  private drawableObject!: DrawableHitObject;

  #sprite?: DrawableSprite;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const texture = this.skin.getTexture('approachcircle');
    if (texture) {
      this.addInternal(this.#sprite = new DrawableSprite({
        texture,
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }));
    }

    this.scale = new Vec2(128 / 118);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.accentColor = this.drawableObject.accentColor.getBoundCopy();
    this.accentColor.addOnChangeListener(color => this.color = color.value, { immediate: true });

    this.drawableObject.applyCustomUpdateState.addListener(this.#applyCustomState, this);
    this.#applyCustomState(this.drawableObject);
  }

  #applyCustomState(drawableObject: DrawableHitObject) {
    this.applyTransformsAt(-Number.MAX_VALUE, true);
    this.clearTransformsAfter(-Number.MAX_VALUE, true);

    switch (drawableObject.state.value) {
      case ArmedState.Hit:
        this.absoluteSequence({ time: drawableObject.hitStateUpdateTime, recursive: true }, () => {
          this.#sprite?.fadeOut();
        });
    }
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.drawableObject.applyCustomUpdateState.removeListener(this.#applyCustomState, this);
  }
}
