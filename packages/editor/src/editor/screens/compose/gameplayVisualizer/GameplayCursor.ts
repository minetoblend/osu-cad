import type { Vec2 } from 'osucad-framework';
import { Anchor, CompositeDrawable, Container, dependencyLoader, DrawablePool, EasingFunction } from 'osucad-framework';
import { OsuSkinComponentLookup } from '../../../../skinning/OsuSkinComponentLookup.ts';
import { SkinnableDrawable } from '../../../../skinning/SkinnableDrawable.ts';
import { CursorTrailPiece } from './CursorTrailPiece.ts';

export class GameplayCursor extends CompositeDrawable {
  @dependencyLoader()
  load() {
    this.origin = Anchor.Center;

    this.addAllInternal(
      this.#cursorTrailPool,
      this.#trailContainer = new Container(),
      new SkinnableDrawable(OsuSkinComponentLookup.Cursor),
    );
  }

  #cursorTrailPool = new DrawablePool(CursorTrailPiece, 10, 25);

  #trailContainer!: Container;

  #lastTrailPosition: Vec2 | null = null;

  update() {
    const distance = this.#lastTrailPosition
      ? this.position.distance(this.#lastTrailPosition)
      : Number.MAX_VALUE;

    if (distance > 25) {
      const trail = this.#cursorTrailPool.get(it => it.position = this.position);

      this.#trailContainer.add(trail);

      trail.clearTransformsAfter(Number.MIN_VALUE);
      trail.fadeOutFromOne(300, EasingFunction.OutQuad).expire();

      this.#lastTrailPosition = this.position;
    }
  }

  updateAfterChildren() {
    super.updateAfterChildren();

    this.#trailContainer.x = -this.x;
    this.#trailContainer.y = -this.y;
  }
}