import type { IInput, PassThroughInputManager, ReadonlyDependencyContainer } from "@osucad/framework";
import { almostEquals, Component, resolved } from "@osucad/framework";
import type { DrawableHitObject } from "../hitObjects/drawables/DrawableHitObject";
import type { Playfield } from "./Playfield";
import { PlayfieldClock } from "./PlayfieldClock";

export abstract class AutoPlayController<T extends DrawableHitObject = DrawableHitObject> extends Component
{
  protected constructor(
    readonly playfield: Playfield,
    readonly inputManager: PassThroughInputManager,
  )
  {
    super();
  }

  @resolved(PlayfieldClock)
  protected playfieldClock!: PlayfieldClock;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.clock = this.playfieldClock;
  }

  protected get hitObjects(): readonly T[]
  {
    return this.playfield.hitObjectContainer.aliveObjects as unknown as readonly T[];
  }

  protected canProcess(hitObject: T): boolean
  {
    return true;
  }

  override update()
  {
    super.update();

    if (almostEquals(this.time.elapsed, 0) || !this.clock!.isRunning)
      return;

    const hitObjects = this.hitObjects.filter(it => this.canProcess(it));
    if (hitObjects.length === 0)
      return;

    const { current, next, prev, index } = this.getCurrentAndNext(this.time.current, hitObjects);

    const inputs = this.process({ current, next, prev, index, hitObjects });

    for (const input of inputs)
    {
      input.apply(this.inputManager.currentState, this.inputManager);
    }
  }

  protected getCurrentAndNext<U extends DrawableHitObject>(time: number, hitObjects: U[]): { current?: U, next?: U, prev?: U, index?: number }
  {
    const activeIndex = hitObjects.findLastIndex(h => time >= h.hitObject.startTime);
    return {
      prev: hitObjects[activeIndex - 1],
      current: hitObjects[activeIndex],
      next: hitObjects[activeIndex + 1],
      index: activeIndex >= 0 ? activeIndex : undefined,
    };
  }

  protected abstract process(ctx: AutoPlayFrameContext<T>): Iterable<IInput>;

  protected didPassStartTime(drawableHitObject: DrawableHitObject)
  {
    const { current: currentTime, elapsed } = this.time;

    return currentTime >= drawableHitObject.hitObject.startTime && (currentTime - elapsed) < drawableHitObject.hitObject.startTime;
  }
}

export interface AutoPlayFrameContext<T extends DrawableHitObject>
{
  prev?: T
  current?: T
  next?: T
  index?: number
  hitObjects: readonly T[]
}
