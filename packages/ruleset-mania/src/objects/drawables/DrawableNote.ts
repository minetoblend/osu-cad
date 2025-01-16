import type { Drawable, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, ReadonlyDependencyContainer, ValueChangedEvent } from '@osucad/framework';
import type { Note } from '../Note';
import { HitResult, ScrollingDirection, SkinnableDrawable } from '@osucad/core';
import { Anchor, Axes } from '@osucad/framework';
import { DefaultNotePiece } from '../../skinning/default/DefaultNotePiece';
import { ManiaSkinComponentLookup } from '../../skinning/ManiaSkinComponentLookup';
import { ManiaSkinComponents } from '../../skinning/ManiaSkinComponents';
import { ManiaAction } from '../../ui/ManiaAction';
import { DrawableManiaHitObject } from './DrawableManiaHitObject';

export class DrawableNote extends DrawableManiaHitObject<Note> implements IKeyBindingHandler<ManiaAction> {
  protected get component(): ManiaSkinComponents {
    return ManiaSkinComponents.Note;
  }

  #headPiece!: Drawable;

  constructor(note?: Note) {
    super(note);

    this.autoSizeAxes = Axes.Y;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.#headPiece = new SkinnableDrawable(new ManiaSkinComponentLookup(this.component), () => new DefaultNotePiece()).with({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
    }));
  }

  protected override onDirectionChanged(e: ValueChangedEvent<ScrollingDirection>) {
    super.onDirectionChanged(e);

    this.#headPiece.anchor = this.#headPiece.origin = e.value === ScrollingDirection.Up ? Anchor.TopCenter : Anchor.BottomCenter;
  }

  protected override checkForResult(userTriggered: boolean, timeOffset: number) {
    if (!userTriggered) {
      if (!this.hitObject.hitWindows.canBeHit(timeOffset))
        this.applyMinResult();

      return;
    }

    let result = this.hitObject!.hitWindows.resultFor(timeOffset);

    if (result === HitResult.None)
      return;

    result = this.getCappedResult(result);
    this.applyResultType(result);
  }

  protected getCappedResult(result: HitResult) {
    return result;
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof ManiaAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<ManiaAction>): boolean {
    if (e.pressed !== this.action.value)
      return false;

    if (this.checkHittable?.(this, this.time.current) === false)
      return false;

    return this.updateResult(true);
  }
}
