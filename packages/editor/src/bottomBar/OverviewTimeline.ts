import type { DragEvent, DragStartEvent, HoverEvent, MouseDownEvent, UIEvent } from "@osucad/framework";
import { Anchor, Axes, Box, CircularContainer, CompositeDrawable, dependencyLoader, MouseButton, resolved, Vec2 } from "@osucad/framework";
import { EditorClock } from "../EditorClock";

export class OverviewTimeline extends CompositeDrawable
{
  #track!: CircularContainer;
  #activeTrack!: Box;
  #thumb!: Thumb;

  @resolved(EditorClock)
  accessor #editorClock!: EditorClock

  @dependencyLoader()
  #load()
  {
    this.relativeSizeAxes = Axes.Both;

    this.padding = { horizontal: 20 };

    this.internalChildren = [
      this.#track = new CircularContainer({
        relativeSizeAxes: Axes.X,
        height: 4,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        masking: true,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            alpha: 0.5,
          }),
          this.#activeTrack = new Box({
            relativeSizeAxes: Axes.Both,
            width: 0,
          }),
        ],
      }),
      this.#thumb = new Thumb().with({ relativePositionAxes: Axes.X }),
    ];
  }

  protected override update()
  {
    super.update();

    const progress = this.#editorClock.currentTime / this.#editorClock.trackLength;

    this.#activeTrack.width = progress;
    this.#thumb.x = progress;
  }

  protected override onMouseDown(e: MouseDownEvent): boolean
  {
    if (e.button === MouseButton.Left)
    {
      this.#seekFromEvent(e);
      return true;
    }

    return super.onMouseDown(e);
  }

  protected override onDragStart(e: DragStartEvent): boolean
  {
    return true;
  }

  protected override onDrag(e: DragEvent): boolean
  {
    this.#seekFromEvent(e);

    return true;
  }

  #seekFromEvent(e: UIEvent)
  {
    const position = this.#track.toLocalSpace(e.screenSpaceMousePosition);

    const progress = position.x / this.#track.drawWidth;

    this.#editorClock.seek(progress * this.#editorClock.trackLength);
  }
}

class Thumb extends CircularContainer
{
  public constructor()
  {
    super({
      size: new Vec2(22, 12),
      masking: true,
      anchor: Anchor.CenterLeft,
      origin: Anchor.Center,
      child: new Box({
        relativeSizeAxes: Axes.Both,
      }),
    });
  }

  protected override onHover(e: HoverEvent): boolean
  {
    return true;
  }
}
