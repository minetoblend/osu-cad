import { Anchor, Axes, dependencyLoader, resolved } from 'osucad-framework';
import { EditorClock } from '../EditorClock';
import {
  OverviewTimelineMarker,
  OverviewTimelineMarkerContainer,
} from './OverviewTimelineMarkerContainer';

export class TimingPointMarkers extends OverviewTimelineMarkerContainer {
  constructor() {
    super({
      height: 3,
    });

    this.y = 3;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @dependencyLoader()
  load() {
    this.beatmap.controlPoints.onAdded.addListener(() =>
      this.invalidateMarkers(),
    );
    this.beatmap.controlPoints.onRemoved.addListener(() =>
      this.invalidateMarkers(),
    );
    this.beatmap.controlPoints.onUpdated.addListener(() =>
      this.invalidateMarkers(),
    );
  }

  createMarkers(): OverviewTimelineMarker[] {
    const trackLength = this.editorClock.trackLength;

    return this.beatmap.controlPoints.controlPoints
      .filter((it) => !!it.timing)
      .map((timingPoint) => {
        const marker = new OverviewTimelineMarker(0xff265a, 1.5);

        marker.x = timingPoint.time / trackLength;

        return marker;
      });
  }
}
