import type { InvalidationSource, ScreenExitEvent, ScreenTransitionEvent } from 'osucad-framework';
import { Action, Axes, dependencyLoader, EasingFunction, Invalidation, Screen } from 'osucad-framework';
import { Editor } from '../Editor.ts';
import { BackgroundAdjustment } from './BackgroundAdjustment.ts';

export class EditorScreen extends Screen {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  override get removeWhenNotAlive() {
    return true;
  }

  editor!: Editor;

  @dependencyLoader()
  [Symbol('load')]() {
    if (this.bottomTimelinePadding)
      this.padding = { bottom: 48 };
  }

  protected loadComplete() {
    super.loadComplete();

    this.editor = this.findClosestParentOfType(Editor)!;
  }

  protected get fadeOutDuration() {
    return 180;
  }

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.editor.applyToBackground((background) => {
      const adjustment = new BackgroundAdjustment();
      this.adjustBackground(adjustment);

      background.moveTo(adjustment.position, adjustment.moveDuration, EasingFunction.OutExpo);
      background.resizeTo(adjustment.size, adjustment.resizeDuration, EasingFunction.OutExpo);
      background.scaleTo(adjustment.scale, adjustment.scaleDuration, EasingFunction.OutExpo);
      background.fadeTo(adjustment.alpha, adjustment.fadeDuration, EasingFunction.OutQuad);
    });
  }

  onExiting(e: ScreenExitEvent): boolean {
    if (super.onExiting(e))
      return true;

    if (this.fadeOutDuration > 0)
      this.fadeOut(this.fadeOutDuration, EasingFunction.OutQuad);

    return false;
  }

  protected adjustBackground(background: BackgroundAdjustment) {
  }

  protected get bottomTimelinePadding() {
    return true;
  }

  exited = new Action();

  override onInvalidate(invalidation: Invalidation, source: InvalidationSource): boolean {
    if (invalidation & Invalidation.Parent) {
      if (this.parent === null)
        this.exited.emit();
    }

    return super.onInvalidate(invalidation, source);
  }
}
