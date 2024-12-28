import type { Container, Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { LifetimeEntry } from '../../../pooling/LifetimeEntry';
import { Axes, resolved } from 'osucad-framework';
import { PooledDrawableWithLifetimeContainer } from '../../../pooling/PooledDrawableWithLifetimeContainer';
import { EditorClock } from '../../EditorClock';
import { Timeline } from './Timeline';
import { TimelinePart } from './TimelinePart';

export abstract class TimelineBlueprintContainer<TEntry extends LifetimeEntry, TDrawable extends Drawable> extends PooledDrawableWithLifetimeContainer<TEntry, TDrawable> {
  @resolved(Timeline)
  protected timeline!: Timeline;

  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  protected blueprintContainer!: Container;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.blueprintContainer = new TimelinePart().with({
      relativeSizeAxes: Axes.Both,
    }));
  }

  protected override addDrawable(entry: TEntry, drawable: TDrawable) {
    this.blueprintContainer.add(drawable);
  }

  protected override removeDrawable(entry: TEntry, drawable: TDrawable) {
    this.blueprintContainer.remove(drawable, false);
  }

  protected override get currentTime(): number {
    return this.editorClock.currentTime;
  }

  override get pastLifetimeExtension() {
    return this.timeline.visibleRange / 2 + 200;
  }

  override get futureLifetimeExtension() {
    return this.timeline.visibleRange / 2 + 200;
  }
}
