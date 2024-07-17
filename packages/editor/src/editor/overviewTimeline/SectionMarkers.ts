import type {
  ColorSource,
  Drawable,
} from 'osucad-framework';
import {
  Axes,
  CompositeDrawable,
  RoundedBox,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { EditorClock } from '../EditorClock';
import { OverviewTimelineMarkerContainer } from './OverviewTimelineMarkerContainer';

export class SectionMarkers extends OverviewTimelineMarkerContainer {
  constructor() {
    super({
      height: 3,
    });

    this.y = 12;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @dependencyLoader()
  load() {
    this.beatmap.hitObjects.onAdded.addListener(() =>
      this.#onHitObjectUpdate(),
    );
    this.beatmap.hitObjects.onRemoved.addListener(() =>
      this.#onHitObjectUpdate(),
    );
    this.beatmap.hitObjects.onUpdated.addListener(() =>
      this.#onHitObjectUpdate(),
    );
  }

  #lastInvalidated: number | null = null;

  #invalidationTimeout = 300;

  #onHitObjectUpdate() {
    this.#lastInvalidated = this.time.current;
  }

  update(): void {
    if (
      this.#lastInvalidated !== null
      && this.time.current - this.#lastInvalidated > this.#invalidationTimeout
    ) {
      this.invalidateMarkers();

      this.#lastInvalidated = null;
    }

    super.update();
  }

  createMarkers(): Drawable[] {
    const trackLength = this.editorClock.trackLength;

    if (trackLength === 0)
      return [];

    const markers: Drawable[] = [];

    const hitObjects = this.beatmap.hitObjects.hitObjects;

    const threshold = 3000;

    let sectionStartTime: number = hitObjects[0].startTime;
    let sectionEndTime = hitObjects[1].endTime;

    for (let i = 1; i < hitObjects.length; i++) {
      const hitObject = hitObjects[i];

      const isLastObject = i === hitObjects.length - 1;

      if (hitObject.startTime - sectionEndTime > threshold || isLastObject) {
        if (isLastObject) {
          sectionEndTime = hitObject.endTime;
        }

        if (!isFinite(sectionStartTime) || !isFinite(sectionEndTime)) {
          break;
        }

        const marker = new SectionMarker({
          width:
            (sectionEndTime - sectionStartTime) / trackLength,
          color: 'gray',
          alpha: 1,
        });

        marker.x = sectionStartTime / trackLength;

        markers.push(marker);

        sectionStartTime = hitObject.startTime;
      }

      sectionEndTime = hitObject.endTime;
    }

    return markers;
  }
}

class SectionMarker extends CompositeDrawable {
  constructor(options: { width: number; color: ColorSource; alpha: number }) {
    super();

    this.relativeSizeAxes = Axes.X;
    this.relativePositionAxes = Axes.X;
    this.height = 3;
    this.width = options.width;
    this.padding = { horizontal: -1.5 };

    this.addInternal(
      new RoundedBox({
        cornerRadius: 1.5,
        relativeSizeAxes: Axes.Both,
        color: options.color,
        alpha: options.alpha,
      }),
    );
  }
}
