import type { ClickEvent } from 'osucad-framework';
import { Anchor, Axes, Box, Container, dependencyLoader, FillDirection, FillFlowContainer, provide, ProxyContainer, resolved } from 'osucad-framework';
import { EditorBeatmap } from '../../EditorBeatmap';
import { CurrentTimeOverlay } from '../../ui/timeline/CurrentTimeOverlay';
import { LayeredTimeline } from '../../ui/timeline/LayeredTimeline';
import { TimelineBoundaryOverlay } from '../../ui/timeline/TimelineBoundaryOverlay';
import { EditorScreen } from '../EditorScreen';
import { editorScreen } from '../metadata';
import { KiaiTimelineLayer } from './kiai/KiaiTimelineLayer';
import { Metronome } from './Metronome';
import { SliderVelocityTimelineLayer } from './sliderVelocity/SliderVelocityTimelineLayer';
import { TimingPointLayer } from './timingPoints/TimingPointLayer';
import { TimingScreenSelectionManager } from './TimingScreenSelectionManager';
import { TimingScreenTickContainer } from './TimingScreenTickContainer';
import { TopTimelineLayer } from './TopTimelineLayer';

@editorScreen({
  id: 'timing',
  name: 'Timing',
})
@provide(TimingScreen)
export class TimingScreen extends EditorScreen {
  @resolved(EditorBeatmap)
  editorBeatmap!: EditorBeatmap;

  @provide(TimingScreenSelectionManager)
  selectionManager = new TimingScreenSelectionManager();

  @dependencyLoader()
  load() {
    this.internalChildren = [
      this.selectionManager,
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { right: 300 },
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0x17171B,
          }),
          this.#timeline = new LayeredTimeline({
            syncWithEditorClock: false,
            timelineChildren: [
              new TimelineBoundaryOverlay(),
              new TimingScreenTickContainer().with({
                alpha: 0.25,
              }),
            ],
            layers: this.createLayers(),
          }),
        ],
      }),
      new Container({
        width: 300,
        relativeSizeAxes: Axes.Y,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0x222228,
          }),
          new FillFlowContainer({
            direction: FillDirection.Vertical,
            relativeSizeAxes: Axes.Both,
            padding: 20,
            children: [
              new Metronome(),
            ],
          }),
        ],
      }),
    ];

    this.#timeline.overlayContainer.add(new ProxyContainer(this.#timeline.timeline).with({
      child: new CurrentTimeOverlay(),
    }));
  }

  #timeline!: LayeredTimeline;

  protected createLayers() {
    return [
      new TopTimelineLayer(),
      new TimingPointLayer(),
      new SliderVelocityTimelineLayer(),
      new KiaiTimelineLayer(),
    ];
  }

  override onClick(e: ClickEvent): boolean {
    this.selectionManager.clear();
    return true;
  }
}
