import type { AudioBufferTrack, ReadonlyDependencyContainer } from '@osucad/framework';
import type { TimelineHitObjectBlueprintContainer } from '../../ui/timeline/hitObjects/TimelineHitObjectBlueprintContainer';
import { Anchor, Axes, BindableBoolean, Container, provide, resolved } from '@osucad/framework';
import { isMobile } from 'pixi.js';
import { EditorRuleset } from '../../../rulesets/EditorRuleset';
import { BottomAlignedTickDisplay } from '../../ui/timeline/BottomAlignedTickDisplay';
import { CurrentTimeOverlay } from '../../ui/timeline/CurrentTimeOverlay';
import { Timeline } from '../../ui/timeline/Timeline';
import { DrawableWaveform } from '../timing/DrawableWaveform';
import { TimelineCursorArea } from '../timing/TimelineCursorArea';

@provide(ComposeScreenTimeline)
export class ComposeScreenTimeline extends Timeline {
  readonly interactionEnabled = new BindableBoolean(true);

  @resolved(EditorRuleset)
  editorRuleset!: EditorRuleset;

  static get HEIGHT() {
    if (isMobile.any)
      return 85;

    return 75;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    this.addRange([
      new DrawableWaveform((this.editorClock.track as AudioBufferTrack)),
      new Container({
        relativeSizeAxes: Axes.Both,
        height: isMobile.any ? 0.55 : 0.65,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        child: this.blueprintContainer = this.editorRuleset.createTimelineHitObjectContainer(),
      }),
      new Container({
        relativeSizeAxes: Axes.X,
        height: 10,
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
        child: new BottomAlignedTickDisplay(),
      }),
      new TimelineCursorArea('compose-timeline', false),
    ]);

    this.addAllInternal(
      new CurrentTimeOverlay(),
    );
  }

  blueprintContainer!: TimelineHitObjectBlueprintContainer;
}
