import type { ReadonlyDependencyContainer, Vec2 } from '@osucad/framework';
import type { HitObjectContainer } from '../HitObjectContainer';
import { Bindable, resolved } from '@osucad/framework';
import { Playfield } from '../Playfield';
import { IScrollingInfo } from './IScrollingInfo';
import { ScrollingDirection } from './ScrollingDirection';
import { ScrollingHitObjectContainer } from './ScrollingHitObjectContainer';

export class ScrollingPlayfield extends Playfield {
  protected readonly direction = new Bindable<ScrollingDirection>(ScrollingDirection.Up);

  override get hitObjectContainer(): ScrollingHitObjectContainer {
    return super.hitObjectContainer as ScrollingHitObjectContainer;
  }

  @resolved(IScrollingInfo)
  scrollingInfo!: IScrollingInfo;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.direction.bindTo(this.scrollingInfo.direction);
  }

  timeAtScreenSpacePosition(screenSpacePosition: Vec2): number {
    return this.hitObjectContainer.timeAtScreenSpacePosition(screenSpacePosition);
  }

  screenSpacePositionAtTime(time: number): Vec2 {
    return this.hitObjectContainer.screenSpacePositionAtTime(time);
  }

  protected override createHitObjectContainer(): HitObjectContainer {
    return this.createScrollingHitObjectContainer();
  }

  protected createScrollingHitObjectContainer(): ScrollingHitObjectContainer {
    return new ScrollingHitObjectContainer();
  }
}
