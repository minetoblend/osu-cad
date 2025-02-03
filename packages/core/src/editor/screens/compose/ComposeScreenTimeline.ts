import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { TimelineHitObjectBlueprintContainer } from '../../ui/timeline/hitObjects/TimelineHitObjectBlueprintContainer';
import { Anchor, Axes, BindableBoolean, Container, provide, resolved } from '@osucad/framework';
import { isMobile } from 'pixi.js';
import { EditorRuleset } from '../../../rulesets/EditorRuleset';
import { BottomAlignedTickDisplay } from '../../ui/timeline/BottomAlignedTickDisplay';
import { CurrentTimeOverlay } from '../../ui/timeline/CurrentTimeOverlay';
import { Timeline } from '../../ui/timeline/Timeline';
import { TimelineCursorArea } from '../timing/TimelineCursorArea';

@provide(ComposeScreenTimeline)
export class ComposeScreenTimeline extends Timeline {
  readonly interactionEnabled = new BindableBoolean(true);

  @resolved(EditorRuleset)
  editorRuleset!: EditorRuleset;

  static get HEIGHT() {
    if (isMobile.phone)
      return 60;

    return 75;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    // if (!isMobile.phone)
    //   this.add(new DrawableWaveform((this.editorClock.track as AudioBufferTrack)));

    this.masking = false;

    this.addRange([
      new Container({
        relativeSizeAxes: Axes.Both,
        height: isMobile.phone ? 0.7 : 0.65,
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
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { horizontal: -400 },
        child: new TimelineCursorArea('compose-timeline', true),
      }),
    ]);

    this.addAllInternal(
      new CurrentTimeOverlay(),
    );
  }

  blueprintContainer!: TimelineHitObjectBlueprintContainer;
}
