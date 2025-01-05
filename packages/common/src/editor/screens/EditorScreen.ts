import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { Axes, CompositeDrawable, EasingFunction, resolved } from 'osucad-framework';
import { BackgroundAdjustment } from '../BackgroundAdjustment';
import { Editor } from '../Editor';

export class EditorScreen extends CompositeDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(() => Editor)
  protected editor!: Editor;

  onEntering() {
    this.fadeInFromZero(200);

    this.editor.applyToBackground((background) => {
      const adjustment = new BackgroundAdjustment();
      this.adjustBackground(adjustment);

      background.moveTo(adjustment.position, adjustment.moveDuration, EasingFunction.OutExpo);
      background.resizeTo(adjustment.size, adjustment.resizeDuration, EasingFunction.OutExpo);
      background.scaleTo(adjustment.scale, adjustment.scaleDuration, EasingFunction.OutExpo);
      background.fadeTo(adjustment.alpha, adjustment.fadeDuration, EasingFunction.OutQuad);
    });
  }

  onExiting() {
    this.fadeOut(200);
  }

  protected get applySafeAreaPadding() {
    return true;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    if (this.applySafeAreaPadding)
      this.padding = { ...this.padding, bottom: 48 };
  }

  override get handlePositionalInput(): boolean {
    if (this.lifetimeEnd !== Number.MAX_VALUE)
      return false;

    return super.handlePositionalInput;
  }

  override get handleNonPositionalInput(): boolean {
    if (this.lifetimeEnd !== Number.MAX_VALUE)
      return false;

    return super.handleNonPositionalInput;
  }

  protected adjustBackground(background: BackgroundAdjustment) {
  }
}
