import type { Bindable } from "@osucad/framework";
import { Anchor, Axes, Box, Cached, CompositeDrawable, Container, resolved, Vec2 } from "@osucad/framework";
import type { Slider } from "../../../hitObjects";
import { PathType } from "../../../hitObjects";
import { Playfield } from "@osucad/core";

export class SliderPathVisualizer extends CompositeDrawable
{
  readonly #segments: Container<Box>;
  readonly #points: Container<SliderPathHandle>;

  private pathVersion!: Bindable<number>;
  private pathPosition!: Bindable<Vec2>;
  readonly #path = new Cached();

  @resolved(Playfield)
  accessor #playfield!: Playfield

  public constructor(public readonly slider: Slider)
  {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.internalChildren = [
      this.#segments = new Container({
        relativeSizeAxes: Axes.Both,
      }),
      this.#points = new Container({
        relativeSizeAxes: Axes.Both,
      }),
    ];
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.pathVersion = this.slider.path.version.getBoundCopy();
    this.pathPosition = this.slider.positionBindable.getBoundCopy();

    this.slider.defaultsApplied.addListener(this.invalidatePath, this);
    this.pathPosition.bindValueChanged(this.invalidatePath, this);
    this.pathVersion.bindValueChanged(this.invalidatePath, this);

    this.scheduler.addDelayed(() => this.#updatePath(), 1);
  }

  protected invalidatePath()
  {
    this.#path.invalidate();
  }

  protected override update()
  {
    super.update();

    if (!this.#path.isValid)
      this.#updatePath();
  }

  protected get controlPoints()
  {
    return this.slider.controlPoints;
  }

  #updatePath()
  {
    const { controlPoints } = this;

    const positions = controlPoints.map(p => this.#playfield.toSpaceOfOtherDrawable(this.slider.stackedPosition.add(p.position), this));

    let currentColor = 0xCCCCCC;

    for (let i = 0; i < controlPoints.length - 1; i++)
    {
      const current = positions[i];
      const next = positions[i + 1];

      if (controlPoints[i].type !== null)
        currentColor = SliderPathVisualizer.getColor(controlPoints[i].type);

      let segment = this.#segments.children[i];
      if (!segment)
      {
        this.#segments.add(segment = new Box({
          height: 1,
          edgeSmoothness: 1,
          origin: Anchor.CenterLeft,
        }));
      }

      segment.position = current;
      segment.rotation = next.sub(current).angle();
      segment.width = current.distance(next);
      segment.color = currentColor;
      this.updateSegmentStyle(segment, i);
    }

    while (this.#segments.children.length > Math.max(controlPoints.length - 1, 0))
      this.#segments.remove(this.#segments.children[this.#segments.children.length - 1]);

    for (let i = 0; i < controlPoints.length; i++)
    {
      let handle = this.#points.children[i];

      if (!handle)
        this.#points.add(handle = this.createSliderPathHandle(i));

      handle.position = positions[i];
      handle.color = SliderPathVisualizer.getColor(controlPoints[i].type);
    }

    while (this.#points.children.length > Math.max(controlPoints.length, 0))
      this.#points.remove(this.#points.children[this.#points.children.length - 1]);

    this.#path.validate();
  }

  protected updateSegmentStyle(segment: Box, index: number)
  {

  }

  protected createSliderPathHandle(index: number)
  {
    return new SliderPathHandle();
  }

  public static getColor(type: PathType | null): number
  {
    switch (type)
    {
    case PathType.Bezier:
      return 0x00FF00;
    case PathType.Catmull:
      return 0xff6efd;
    case PathType.PerfectCurve:
      return 0x324dfc;
    case PathType.Linear:
      return 0xFF0000;
    case PathType.BSpline:
      return 0x00FFFF;
    default:
      return 0xCCCCCC;
    }
  }

  public override dispose(): void
  {
    this.slider.defaultsApplied.removeListener(this.invalidatePath, this);

    super.dispose();
  }
}

export class SliderPathHandle extends CompositeDrawable
{
  public constructor()
  {
    super();

    this.origin = Anchor.Center;
    this.size = new Vec2(8);

    this.internalChildren = [
      new Box({
        size: 8,
        color: 0x000000,
        alpha: 0.5,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      new Box({
        size: 7,
        color: 0xffffff,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    ];
  }
}
