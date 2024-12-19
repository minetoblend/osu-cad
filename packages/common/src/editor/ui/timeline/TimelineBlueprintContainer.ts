import type { Drawable } from 'osucad-framework';
import type { LifetimeEntry } from '../../../pooling/LifetimeEntry';
import { resolved } from 'osucad-framework';
import { PooledDrawableWithLifetimeContainer } from '../../../pooling/PooledDrawableWithLifetimeContainer';
import { EditorClock } from '../../EditorClock';
import { Timeline } from './Timeline';

export abstract class TimelineBlueprintContainer<TEntry extends LifetimeEntry, TDrawable extends Drawable> extends PooledDrawableWithLifetimeContainer<TEntry, TDrawable> {
  @resolved(Timeline)
  timeline!: Timeline;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  protected override get currentTime(): number {
    return this.timeline.currentTime;
  }

  override get pastLifetimeExtension() {
    return this.timeline.visibleDuration / 2 + 200;
  }

  override get futureLifetimeExtension() {
    return this.timeline.visibleDuration / 2 + 200;
  }
}
