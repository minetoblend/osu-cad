import type { Drawable } from "../drawables";
import { type IVec2, Vec2 } from "../../math/Vec2";
import { Axes } from "../drawables/Axes";
import { Container, type ContainerOptions } from "./Container";

export interface DrawSizePreservingFillContainerOptions<T extends Drawable = Drawable> extends ContainerOptions<T> 
{
  strategy?: DrawSizePreservationStrategy;
  targetDrawSize?: IVec2;
}

export class DrawSizePreservingFillContainer<T extends Drawable = Drawable> extends Container<T> 
{
  strategy: DrawSizePreservationStrategy = DrawSizePreservationStrategy.Minimum;
  targetDrawSize = new Vec2(1024, 768);

  readonly #content: Container<T>;

  constructor(options: DrawSizePreservingFillContainerOptions<T> = {}) 
  {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.addInternal(
        (this.#content = new Container<T>({
          relativeSizeAxes: Axes.Both,
        })),
    );

    this.with(options);
  }

  override update() 
  {
    const drawSizeRatio = this.parent!.childSize.div(this.targetDrawSize);

    switch (this.strategy) 
    {
    case DrawSizePreservationStrategy.Minimum:
      this.#content.scale = new Vec2(Math.min(drawSizeRatio.x, drawSizeRatio.y));
      break;
    case DrawSizePreservationStrategy.Maximum:
      this.#content.scale = new Vec2(Math.max(drawSizeRatio.x, drawSizeRatio.y));
      break;
    case DrawSizePreservationStrategy.Average:
      this.#content.scale = new Vec2((drawSizeRatio.x + drawSizeRatio.y) / 2);
      break;
    case DrawSizePreservationStrategy.Stretch:
      this.#content.scale = drawSizeRatio;
      break;
    }

    this.#content.size = {
      x: drawSizeRatio.x === 0 ? 0 : 1 / drawSizeRatio.x,
      y: drawSizeRatio.y === 0 ? 0 : 1 / drawSizeRatio.y,
    };

    this.#content.position = new Vec2(
        (this.parent!.childSize.x - this.#content.scale.x * this.#content.drawSize.x) / 2,
        (this.parent!.childSize.y - this.#content.scale.y * this.#content.drawSize.y) / 2,
    );

    super.update();
  }

  override get content() 
  {
    return this.#content;
  }
}

export enum DrawSizePreservationStrategy 
{
  Minimum,
  Maximum,
  Average,
  Stretch,
}
