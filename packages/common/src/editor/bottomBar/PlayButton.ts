import type { HoverEvent, HoverLostEvent, MouseDownEvent, MouseUpEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable, DrawableSprite, MouseButton, resolved, Vec2 } from 'osucad-framework';
import { OsucadColors } from '../../OsucadColors';
import { getIcon } from '../../OsucadIcons';
import { EditorClock } from '../EditorClock';

export class PlayButton extends CompositeDrawable {
  @resolved(EditorClock)
  editorClock!: EditorClock;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.size = new Vec2(26);

    this.addInternal(this.#icon = new DrawableSprite({
      relativeSizeAxes: Axes.Both,
      texture: getIcon('play'),
      color: OsucadColors.text,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));

    this.editorClock.started.addListener(this.#updateIcon, this);
    this.editorClock.stopped.addListener(this.#updateIcon, this);
  }

  #icon!: DrawableSprite;

  #updateIcon() {
    this.#icon.texture
        = this.editorClock.isRunning
        ? getIcon('pause')
        : getIcon('play');
  }

  override onHover(e: HoverEvent): boolean {
    this.#icon.color = 0xFFFFFF;
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#icon.color = OsucadColors.text;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      if (this.editorClock.isRunning)
        this.editorClock.stop();
      else
        this.editorClock.start();

      this.#icon.scaleTo(0.9);

      return true;
    }

    return false;
  }

  override onMouseUp(e: MouseUpEvent) {
    this.#icon.scaleTo(1);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.editorClock.started.removeListener(this.#updateIcon, this);
    this.editorClock.stopped.removeListener(this.#updateIcon, this);
  }
}