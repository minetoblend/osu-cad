import { dependencyLoader, resolved } from 'osucad-framework';
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

    this.y = 7;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @dependencyLoader()
  load() {
    this.beatmap.controlPoints.groupAdded.addListener(() =>
      this.invalidateMarkers(),
    );
    this.beatmap.controlPoints.groupRemoved.addListener(() =>
      this.invalidateMarkers(),
    );
    // this.beatmap.controlPoints.updated.addListener(() =>
    //   this.invalidateMarkers(),
    // );
  }

  createMarkers(): OverviewTimelineMarker[] {
    const trackLength = this.editorClock.trackLength;

    return this.beatmap.controlPoints.difficultyPoints
      .items
      .map((timingPoint) => {
        const marker = new OverviewTimelineMarker(0x6AF878, 2);

        marker.x = timingPoint.time / trackLength;

        return marker;
      });
  }
}
