import type {
  IKeyBindingHandler,
  KeyBindingPressEvent,
  Vec2,
} from 'osucad-framework';
import type { DrawableHitCircle } from '../../editor/hitobjects/DrawableHitCircle.ts';
import {
  Anchor,
  Container,
  resolved,
} from 'osucad-framework';
import { DrawableHitObject } from '../../editor/hitobjects/DrawableHitObject.ts';
import { OsuAction } from '../../gameplay/OsuAction.ts';
import { OsuHitObject } from './OsuHitObject.ts';

export class HitReceptor extends Container implements IKeyBindingHandler<OsuAction> {
  constructor(
    readonly hit: () => void,
  ) {
    super();

    this.size = OsuHitObject.object_dimensions;
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
  }

  @resolved(DrawableHitObject)
  hitObject!: DrawableHitCircle;

  receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return true;
  }

  containsLocal(localPosition: Vec2): boolean {
    return localPosition.distance(this.drawSize.scale(0.5)) <= OsuHitObject.object_radius;
  }

  readonly isKeyBindingHandler = true;

  hitAction: OsuAction | null = null;

  closestPressPosition: Vec2 | null = null;

  canHandleKeyBinding(binding: OsuAction) {
    return binding instanceof OsuAction;
  }

  get screenSpaceCenter() {
    return this.toScreenSpace(this.drawSize.scale(0.5));
  }

  canBeHit() {
    return !this.hitObject.judged;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<OsuAction>): boolean {
    if (!this.canBeHit())
      return false;

    switch (e.pressed) {
      case OsuAction.LeftButton:
      case OsuAction.RightButton:
      {
        if (this.closestPressPosition) {
          const oldDist = this.closestPressPosition.distanceSq(this.screenSpaceCenter);
          const newDist = e.screenSpaceMousePosition.distanceSq(this.screenSpaceCenter);

          if (newDist < oldDist)
            this.closestPressPosition = e.screenSpaceMousePosition;
        }
        else {
          this.closestPressPosition = e.screenSpaceMousePosition;
        }

        if (this.contains(e.screenSpaceMousePosition)) {
          this.hit();

          this.hitAction ??= e.pressed;

          return true;
        }
      }
    }

    return false;
  }

  reset() {
    this.hitAction = null;
    this.closestPressPosition = null;
  }
}