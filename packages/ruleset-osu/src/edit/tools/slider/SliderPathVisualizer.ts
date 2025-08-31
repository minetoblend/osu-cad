import type { Bindable } from "@osucad/framework";
import { Anchor, Axes, Box, CompositeDrawable, Container, resolved, Vec2 } from "@osucad/framework";
import type { Slider } from "../../../hitObjects";
import { PathType } from "../../../hitObjects";
import { Playfield } from "@osucad/core";

export class SliderPathVisualizer extends CompositeDrawable
{
  readonly #segments: Container<Box>;
  readonly #points: Container<PathHandle>;

  private pathVersion!: Bindable<number>;
  private pathPosition!: Bindable<Vec2>;

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

    this.slider.defaultsApplied.addListener(this.#defaultsApplied, this);
    this.pathPosition.bindValueChanged(() => this.scheduler.addOnce(this.#updatePath, this));
    this.pathVersion.bindValueChanged(() => this.#updatePath());

    this.scheduler.addDelayed(() => this.#updatePath(), 1);
  }

  #defaultsApplied()
  {
    this.#updatePath();
  }

  @resolved(Playfield)
  accessor #playfield!: Playfield

  #updatePath()
  {
    const { controlPoints } = this.slider.path;

    const positions = controlPoints.map(p => this.#playfield.toSpaceOfOtherDrawable(this.slider.position.add(p.position), this));

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
    }

    while (this.#segments.children.length > Math.max(controlPoints.length - 1, 0))
      this.#segments.remove(this.#segments.children[this.#segments.children.length - 1]);

    for (let i = 0; i < controlPoints.length; i++)
    {
      let handle = this.#points.children[i];

      if (!handle)
        this.#points.add(handle = new PathHandle());

      handle.position = positions[i];
      handle.color = SliderPathVisualizer.getColor(controlPoints[i].type);
    }

    while (this.#points.children.length > Math.max(controlPoints.length, 0))
      this.#points.remove(this.#points.children[this.#points.children.length - 1]);
  }

  public static getColor(type: PathType | null)
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
    this.slider.defaultsApplied.removeListener(this.#defaultsApplied, this);

    super.dispose();
  }
}

class PathHandle extends CompositeDrawable
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
