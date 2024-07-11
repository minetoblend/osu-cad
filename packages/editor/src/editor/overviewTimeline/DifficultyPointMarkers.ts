import { Anchor, Axes, dependencyLoader, resolved } from 'osucad-framework';
import { EditorClock } from '../EditorClock';
import {
  OverviewTimelineMarker,
  OverviewTimelineMarkerContainer,
} from './OverviewTimelineMarkerContainer';

export class DifficultyPointMarkers extends OverviewTimelineMarkerContainer {
  constructor() {
    super({
      height: 3,
    });

    this.y = 8;
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
      .filter((it) => it.velocityMultiplier !== null)
      .map((timingPoint) => {
        const marker = new OverviewTimelineMarker(0x10eb6b);

        marker.x = timingPoint.time / trackLength;

        return marker;
      });
  }
}
