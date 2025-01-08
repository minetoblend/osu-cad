import type { ScreenExitEvent } from 'osucad-framework';
import type { EditorBeatmap } from './EditorBeatmap';
import { Anchor, Axes, DrawableSprite, FillMode, loadTexture } from 'osucad-framework';
import { BackgroundScreen } from '../screens/BackgroundScreen';

export class EditorBackground extends BackgroundScreen {
  constructor(
    readonly editorBeatmap: EditorBeatmap,
  ) {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.relativePositionAxes = Axes.Both;
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
  }

  protected override loadComplete() {
    super.loadComplete();

    const filename = this.editorBeatmap.metadata.backgroundFile?.trim();
    if (!filename)
      return;

    this.editorBeatmap.fileStore.getFile(filename)?.getData().then(data => loadTexture(data)).then((texture) => {
      if (!texture)
        return;
      const sprite = new DrawableSprite({
        texture,
        relativeSizeAxes: Axes.Both,
        fillMode: FillMode.Fill,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      });

      this.addInternal(sprite);
      sprite.fadeTo(0).fadeTo(0.75, 500);
    });
  }

  override onExiting(e: ScreenExitEvent): boolean {
    this.fadeOut(100);

    return false;
  }
}
