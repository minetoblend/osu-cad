import type { Vec2 } from "@osucad/framework";
import { Anchor, Axes, Box, CompositeDrawable, dependencyLoader, provideSelf, resolved } from "@osucad/framework";
import { EditorClock } from "../../EditorClock";
import { TimelineTickDisplay } from "./TimelineTickDisplay";

@provideSelf()
export class ComposeTimeline extends CompositeDrawable
{
  public static readonly HEIGHT = 80;

  @resolved(EditorClock)
  accessor #clock!: EditorClock

  @dependencyLoader()
  #load()
  {
    this.relativeSizeAxes = Axes.X;
    this.height = ComposeTimeline.HEIGHT;

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
        alpha: 0.6,
      }),
      new TimelineTickDisplay(),
      new Box({
        relativeSizeAxes: Axes.Y,
        width: 2,
        anchor: Anchor.TopCenter,
        origin: Anchor.TopCenter,
        color: "red",
      }),
    ];
  }

  public zoom = 1;

  public get visibleDuration()
  {
    return this.zoom * 4000;
  }

  public get startTime()
  {
    return this.#clock.currentTime - this.visibleDuration * 0.5;
  }

  public get endTime()
  {
    return this.#clock.currentTime + this.visibleDuration * 0.5;
  }

  public timeAt(screenSpacePosition: Vec2)
  {
    const local = this.toLocalSpace(screenSpacePosition);

    return this.startTime + (local.x / this.drawWidth) * this.visibleDuration;
  }

  public positionAt(time: number)
  {
    return (time - this.startTime) / this.visibleDuration * this.drawWidth;
  }
}
