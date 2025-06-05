import type { DrawableSpriteOptions, MouseMoveEvent } from "@osucad/framework";
import { Anchor, Axes, clamp, CompositeDrawable, DrawableSprite, FramedClock, InputResampler, Vec2 } from "@osucad/framework";
import type { Texture } from "pixi.js";

export abstract class CursorTrail extends CompositeDrawable
{
  protected constructor()
  {
    super();

    this.clock = new FramedClock();
    this.processCustomClock = true;

    this.relativeSizeAxes = Axes.Both;
  }

  readonly #resampler = new InputResampler();

  #lastPosition: Vec2 | null = null;

  public texture: Texture | null = null;

  public trailOrigin: Anchor = Anchor.Center;

  public globalPartScale = 1;

  public newPartScale = new Vec2(1);


  protected get fadeDuration()
  {
    return 300;
  }

  protected get interpolateMovements()
  {
    return true;
  }

  protected get intervalMultiplier()
  {
    return 1;
  }

  protected get avoidDrawingNearCursor()
  {
    return false;
  }

  protected get fadeExponent()
  {
    return 1.7;
  }

  override onMouseMove(e: MouseMoveEvent): boolean
  {
    this.addTrail(e.screenSpaceMousePosition);
    return false;
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean
  {
    return true;
  }

  protected addTrail(position: Vec2)
  {
    if (this.texture === null)
      return;

    position = this.toLocalSpace(position);

    if (this.interpolateMovements)
    {
      if (!this.#lastPosition)
      {
        this.#lastPosition = position;
        this.#resampler.addPosition(this.#lastPosition);
        return;
      }

      for (const pos2 of this.#resampler.addPosition(position))
      {
        const pos1: Vec2 = this.#lastPosition!;

        const diff = pos2.sub(pos1);
        const distance = diff.length();
        const direction = diff.divF(distance);

        const interval = this.texture.width / 2.5 * this.intervalMultiplier;
        const stopAt = distance - (this.avoidDrawingNearCursor ? interval : 0);

        for (let d = interval; d < stopAt; d += interval)
        {
          this.#lastPosition = pos1.add(direction.scale(d));
          this.#addPart(this.#lastPosition!);
        }
      }
    }
    else
    {
      this.#lastPosition = position;
      this.#addPart(position);
    }
  }

  #addPart(localSpacePosition: Vec2)
  {
    const sprite = new TrailPart(this.#time + 1, {
      texture: this.texture,
      origin: this.trailOrigin,
      position: localSpacePosition,
      scale: this.newPartScale.scale(this.globalPartScale),
    });

    this.addInternal(sprite);
  }

  #time = 0;

  override update()
  {
    super.update();

    const time = this.#time = this.time.current / this.fadeDuration;

    const fadeExponent = this.fadeExponent;

    for (const c of this.internalChildren as TrailPart[])
    {
      const alpha = Math.pow(
          clamp(c.startTime - time, 0, 1),
          fadeExponent,
      );

      if (alpha <= 0)
      {
        c.expire();
        continue;
      }

      c.alpha = alpha;
    }
  }
}

class TrailPart extends DrawableSprite
{
  constructor(
    readonly startTime: number,
    options: DrawableSpriteOptions,
  )
  {
    super(options);
  }
}
