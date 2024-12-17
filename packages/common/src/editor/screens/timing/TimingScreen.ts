import {
  Axes,
  Box,
  dependencyLoader,
  provide,
  ProxyContainer,
  resolved,
} from 'osucad-framework';
import { EditorBeatmap } from '../../EditorBeatmap';
import { CurrentTimeOverlay } from '../../ui/timeline/CurrentTimeOverlay';
import { LayeredTimeline } from '../../ui/timeline/LayeredTimeline';
import { TimelineBoundaryOverlay } from '../../ui/timeline/TimelineBoundaryOverlay';
import { EditorScreen } from '../EditorScreen';
import { editorScreen } from '../metadata';
import { KiaiTimelineLayer } from './KiaiTimelineLayer';
import { SliderVelocityTimelineLayer } from './SliderVelocityTimelineLayer';
import { TimingPointLayer } from './TimingPointLayer';
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

  @dependencyLoader()
  load() {
    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x17171B,
      }),
      this.#timeline = new LayeredTimeline({
        timelineChildren: [
          new TimelineBoundaryOverlay(),
          new TimingScreenTickContainer().with({
            alpha: 0.25,
          }),
        ],
        layers: this.createLayers(),
      }),
      new ProxyContainer(this.#timeline.timeline).with({
        child: new CurrentTimeOverlay(),
      }),
    ];
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
}
