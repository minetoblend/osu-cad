import type { Playfield } from "./Playfield";
import type { DrawableHitObject } from "../hitObjects/drawables/DrawableHitObject";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Component } from "@osucad/framework";
import { PlayfieldClock } from "./PlayfieldClock";

export abstract class GameplayProcessor<TPlayfield extends Playfield = Playfield> extends Component
{
  protected constructor(protected readonly playfield: TPlayfield)
  {
    super();
  }

  override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.clock = dependencies.resolve(PlayfieldClock);
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.playfield.hitObjectApplied.addListener(this.onHitObjectApplied, this);
  }

  protected abstract processFrame(currentTime: number, hitObjects: DrawableHitObject[]): void;

  protected onHitObjectApplied(hitObject: DrawableHitObject)
  {}

  override update()
  {
    super.update();

    this.processFrame(this.time.current, this.playfield.hitObjectContainer.aliveObjects);
  }

  override dispose(isDisposing?: boolean)
  {
    super.dispose(isDisposing);

    this.playfield.hitObjectApplied.removeListener(this.onHitObjectApplied, this);
  }

}

