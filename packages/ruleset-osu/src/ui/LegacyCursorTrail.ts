import type { MouseMoveEvent, Vec2 } from "@osucad/framework";
import { Anchor, type ReadonlyDependencyContainer } from "@osucad/framework";
import { CursorTrail } from "./CursorTrail";
import type { ISkin } from "@osucad/core";
import { ISkinSource } from "@osucad/core";

const disjoint_trail_time_separation = 1000 / 60.0;

export class LegacyCursorTrail extends CursorTrail
{
  readonly #skin: ISkin;

  #currentPosition: Vec2 | null = null;
  #lastTrailTime = Number.NEGATIVE_INFINITY;

  constructor(skin: ISkin)
  {
    super();

    this.#skin = skin;
  }

  allowPartRotation = false;

  disjointTrail = false;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    const skinSource = dependencies.resolve(ISkinSource);

    this.allowPartRotation = this.#skin.getConfig("cursorTrailRotate") ?? true;

    this.texture = this.#skin.getTexture("cursortrail");

    const cursorProvider = skinSource.findProvider(s => s.getTexture("cursor") !== null);
    this.disjointTrail = cursorProvider?.getTexture("cursormiddle") === null;

    if (this.disjointTrail)
    {
      const centre = this.#skin.getConfig("cursorCentre") ?? true;

      this.trailOrigin = centre ? Anchor.Center : Anchor.TopLeft;
    }
    else
    {
      this.blendMode = "add";
    }

    this.globalPartScale /= 1.6;
  }

  protected override get fadeDuration(): number
  {
    return this.disjointTrail ? 150 : 500;
  }

  protected override get fadeExponent(): number
  {
    return 1;
  }

  protected override get interpolateMovements(): boolean
  {
    return !this.disjointTrail;
  }

  protected override get avoidDrawingNearCursor(): boolean
  {
    return !this.disjointTrail;
  }

  override update()
  {
    super.update();

    if (!this.disjointTrail || !this.#currentPosition)
      return;

    if (this.time.current - this.#lastTrailTime >= disjoint_trail_time_separation)
    {
      this.#lastTrailTime = this.time.current;
      this.addTrail(this.#currentPosition);
    }
  }

  override onMouseMove(e: MouseMoveEvent): boolean
  {
    if (!this.disjointTrail)
      return super.onMouseMove(e);

    this.#currentPosition = e.screenSpaceMousePosition;

    return false;
  }
}
