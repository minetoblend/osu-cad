import type { EditorBackground } from '../EditorBackground.ts';
import { Axes, Container, EasingFunction } from 'osucad-framework';
import { Editor } from '../Editor.ts';

export class EditorScreen extends Container {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  editor!: Editor;

  protected loadComplete() {
    super.loadComplete();

    this.editor = this.findClosestParentOfType(Editor)!;
  }

  protected get fadeInDuration() {
    return 300;
  }

  protected get fadeOutDuration() {
    return 180;
  }

  show() {
    this.fadeInFromZero(this.fadeInDuration);

    this.editor.applyToBackground(background => this.adjustBackground(background as EditorBackground));
  }

  hide() {
    this.fadeOut(this.fadeOutDuration, EasingFunction.OutQuad);
  }

  adjustBackground(background: EditorBackground) {
    background.scaleTo(1, 500, EasingFunction.OutExpo);
    background.fadeTo(1, 500, EasingFunction.OutQuad);
  }
}
