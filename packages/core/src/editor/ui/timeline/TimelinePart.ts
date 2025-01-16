import type { Drawable } from '@osucad/framework';
import { Axes, Container, resolved, Vec2 } from '@osucad/framework';
import { EditorClock } from '../../EditorClock';

export class TimelinePart<T extends Drawable = Drawable> extends Container<T> {
  constructor(content?: Container<T>) {
    super();

    this.addInternal(this.#content = content ?? new Container({
      relativeSizeAxes: Axes.Both,
    }));
  }

  readonly #content!: Container<T>;

  override get content(): Container<T> {
    return this.#content;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #updateRelativeChildSize() {
    this.content.relativeChildSize = new Vec2(Math.max(1, this.editorClock.trackLength), 1);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.#updateRelativeChildSize();

    // TODO: update relativeChildSize when track length changes
  }
}
