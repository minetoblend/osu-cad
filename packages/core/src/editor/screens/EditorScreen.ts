import type { Drawable } from '@osucad/framework';
import { Axes, Bindable, Container, EasingFunction, EmptyDrawable, resolved } from '@osucad/framework';
import { BackgroundAdjustment } from '../BackgroundAdjustment';
import { Editor } from '../Editor';
import { EditorSafeArea } from '../EditorSafeArea';
import { Corner } from '../ui/Corner';
import { EditorCornerContent } from '../ui/EditorCornerContent';
import { PrimaryActionContainer } from '../ui/PrimaryActionContainer';

export class EditorScreen extends Container {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(() => Editor)
  protected editor!: Editor;

  readonly safeAreaPadding = new Bindable(EditorSafeArea.default);

  topBarContent!: Drawable;

  createTopBarContent(): Drawable {
    return new EmptyDrawable();
  }

  topLeftCornerContent!: EditorCornerContent;

  createTopLeftCornerContent(): EditorCornerContent {
    return new PrimaryActionContainer();
  }

  topRightCornerContent!: EditorCornerContent;

  createTopRightCornerContent(): EditorCornerContent {
    return new EditorCornerContent(Corner.TopRight);
  }

  onEntering(previous?: EditorScreen) {
    this.enterTransition();

    this.editor.applyToBackground((background) => {
      const adjustment = new BackgroundAdjustment();
      this.adjustBackground(adjustment);

      background.moveTo(adjustment.position, adjustment.moveDuration, EasingFunction.OutExpo);
      background.resizeTo(adjustment.size, adjustment.resizeDuration, EasingFunction.OutExpo);
      background.scaleTo(adjustment.scale, adjustment.scaleDuration, EasingFunction.OutExpo);
      background.fadeTo(adjustment.alpha, adjustment.fadeDuration, EasingFunction.OutQuad);
    });
  }

  protected enterTransition() {
    this.fadeInFromZero(200);
  }

  onExiting() {
    this.exitTransition();
  }

  protected exitTransition() {
    this.fadeOut(200);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.topBarContent = this.createTopBarContent();
    this.topLeftCornerContent = this.createTopLeftCornerContent();
    this.topRightCornerContent = this.createTopRightCornerContent();

    this.loadComponents([
      this.topBarContent,
      this.topLeftCornerContent,
      this.topRightCornerContent,
    ]);

    this.safeAreaPadding.bindValueChanged(safeArea => this.applySafeAreaPadding(safeArea.value), true);
  }

  protected applySafeAreaPadding(safeArea: EditorSafeArea) {
    this.padding = {
      top: safeArea.top,
      bottom: safeArea.bottom,
    };
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
