import type { ContainerOptions, Drawable } from "@osucad/framework";
import { Axes, Container, dependencyLoader, resolved, Vec2 } from "@osucad/framework";
import { EditorClock } from "../../EditorClock";
import { ComposeTimeline } from "./ComposeTimeline";

export class TimelinePart<T extends Drawable = Drawable> extends Container<T>
{
  readonly #content: Container<T> = new Container({ relativeSizeAxes: Axes.Both });

  protected override get content(): Container<T>
  {
    return this.#content;
  }

  public constructor(options: ContainerOptions<T> = {})
  {
    super();

    this.internalChild = this.#content;
    this.relativeSizeAxes = Axes.Both;

    this.with(options);
  }

  @resolved(EditorClock)
  accessor #editorClock!: EditorClock

  @resolved(() => ComposeTimeline)
  accessor #timeline!: ComposeTimeline

  @dependencyLoader()
  #load()
  {
    this.#updateRelativeChildSize();
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.#editorClock.trackChanged.addListener(this.#updateRelativeChildSize, this);

    this.#timeline.zoomChanged.addListener(this.#updateRelativeChildSize, this);
  }

  #updateRelativeChildSize()
  {
    const trackLength = this.#editorClock.trackLength;

    this.#content.relativeChildSize = new Vec2(Math.max(1, trackLength), 1);
  }

  public override dispose(): void
  {
    this.#timeline.zoomChanged.removeListener(this.#updateRelativeChildSize, this);
    this.#editorClock.trackChanged.removeListener(this.#updateRelativeChildSize, this);

    super.dispose();
  }
}
