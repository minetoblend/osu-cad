import type { Bindable } from "@osucad/framework";
import { Anchor, Box, resolved, Vec2 } from "@osucad/framework";
import { Axes, Container } from "@osucad/framework";
import { CompositeDrawable } from "@osucad/framework";
import type { Slider } from "../../../hitObjects";
import { Playfield } from "@osucad/core";

export class SliderPathVisualizer extends CompositeDrawable
{
  readonly #segments: Container<Box>;
  readonly #points: Container<PathHandle>;

  private pathVersion!: Bindable<number>;

  constructor(readonly slider: Slider)
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

    this.pathVersion.bindValueChanged(() => this.scheduler.addOnce(this.#updatePath, this), true);
    this.scheduler.addDelayed(() => this.#updatePath(), 1);
  }

  @resolved(Playfield)
  accessor #playfield!: Playfield

  #updatePath()
  {
    const { controlPoints } = this.slider.path;

    const positions = controlPoints.map(p => this.#playfield.toSpaceOfOtherDrawable(this.slider.position.add(p.position), this));

    for (let i = 0; i < controlPoints.length - 1; i++)
    {
      const current = positions[i];
      const next = positions[i + 1];

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
    }

    while (this.#segments.children.length > Math.max(controlPoints.length - 1, 0))
      this.#segments.remove(this.#segments.children[this.#segments.children.length - 1]);

    for (let i = 0; i < controlPoints.length; i++)
    {
      let handle = this.#points.children[i];

      if (!handle)
        this.#points.add(handle = new PathHandle());

      handle.position = positions[i];
    }

    while (this.#points.children.length > Math.max(controlPoints.length, 0))
      this.#points.remove(this.#points.children[this.#points.children.length - 1]);
  }
}

class PathHandle extends CompositeDrawable
{
  constructor()
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
