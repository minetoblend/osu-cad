import {
  CreateHitObjectCommand,
  DeleteHitObjectCommand,
  HitCircle,
  PathType,
  SerializedPathPoint,
  Slider,
  UpdateHitObjectCommand,
} from '@osucad/common';
import {
  MouseButton,
  MouseDownEvent,
  MouseMoveEvent,
  MouseUpEvent,
  almostEquals,
  dependencyLoader,
} from 'osucad-framework';
import { ComposeTool } from './ComposeTool';
import { DistanceSnapProvider } from './DistanceSnapProvider';
import { SliderPathVisualizer } from './SliderPathVisualizer';
import { SliderUtils } from './SliderUtils';

export class SliderTool extends ComposeTool {
  constructor() {
    super();
  }

  #sliderPathVisualizer = new SliderPathVisualizer();

  #previewCircle?: HitCircle;

  #slider?: Slider;

  #state = PlacementState.Preview;

  #segmentStart = 0;

  #path: SerializedPathPoint[] = [];

  get #segmentLength() {
    if (!this.#slider) return 0;

    return this.#slider!.path.controlPoints.length - this.#segmentStart;
  }

  #sliderUtils!: SliderUtils;

  @dependencyLoader()
  load() {
    this.newCombo.value = false;

    this.newCombo.addOnChangeListener((newCombo) =>
      this.#updateNewCombo(newCombo),
    );

    this.#state = PlacementState.Preview;

    const distanceSnapProvider = new DistanceSnapProvider();
    this.addInternal(distanceSnapProvider);

    this.#sliderUtils = new SliderUtils(
      this.commandManager,
      distanceSnapProvider,
    );

    this.addInternal(this.#sliderPathVisualizer);
  }

  #createPreviewCircle() {
    this.#previewCircle = new HitCircle();
    this.#previewCircle.position = this.mousePosition;

    this.hitObjects.add(this.#previewCircle!);
  }

  update() {
    super.update();

    if (this.#state === PlacementState.Preview) {
      if (!this.#previewCircle) this.#createPreviewCircle();

      this.#updatePreviewCircle();
    }
  }

  #updatePreviewCircle() {
    this.#previewCircle!.startTime = this.editorClock.currentTime;
    this.#previewCircle!.position = this.mousePosition;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      switch (this.#state) {
        case PlacementState.Preview:
          this.#beginPlacing();
          return true;
        case PlacementState.PlacingPoint:
          this.#beginPlacingPoint();
          return true;
      }
    } else if (e.button === MouseButton.Right) {
      switch (this.#state) {
        case PlacementState.Preview:
          this.newCombo.value = !this.newCombo.value;
          break;
        case PlacementState.PlacingPoint:
          this.#endPlacing();
      }
    }

    return false;
  }

  onMouseMove(e: MouseMoveEvent): boolean {
    switch (this.#state) {
      case PlacementState.PlacingPoint:
      case PlacementState.DraggingPoint:
        const path = [...this.#path];

        const position = this.mousePosition.sub(this.#slider!.stackedPosition);

        if (position.distance(path[path.length - 2]) < 5) {
          if (
            this.#segmentLength === 4 &&
            path[this.#segmentStart].type === PathType.Bezier
          ) {
            path[this.#segmentStart].type = PathType.PerfectCurve;
          } else if (
            this.#segmentLength === 5 &&
            path[this.#segmentStart].type === PathType.PerfectCurve
          ) {
            path[this.#segmentStart].type = PathType.Bezier;
          }

          this.#sliderUtils.setPath(
            this.#slider!,
            path.slice(0, Math.max(path.length - 1, 2)),
            false,
          );
        } else {
          path[path.length - 1] = { x: position.x, y: position.y, type: null };

          if (
            this.#segmentLength === 3 &&
            path[this.#segmentStart].type === PathType.Bezier
          ) {
            path[this.#segmentStart].type = PathType.PerfectCurve;
          } else if (
            this.#segmentLength === 4 &&
            path[this.#segmentStart].type === PathType.PerfectCurve
          ) {
            path[this.#segmentStart].type = PathType.Bezier;
          }

          this.#sliderUtils.setPath(this.#slider!, path, false);
        }

        return true;
    }

    return false;
  }

  onMouseUp(e: MouseUpEvent): boolean {
    if (e.button === MouseButton.Left) {
      switch (this.#state) {
        case PlacementState.DraggingPoint:
          this.#endPlacingPoint();
          return true;
      }
    }

    return false;
  }

  #beginPlacing() {
    if (this.#previewCircle) {
      this.hitObjects.remove(this.#previewCircle);
      this.#previewCircle = undefined;
    }

    const slider = new Slider();
    slider.startTime = this.beatmap.controlPoints.snap(
      this.editorClock.currentTime,
      this.beatSnapDivisor,
    );
    slider.path.controlPoints = [
      { x: 0, y: 0, type: PathType.Bezier },
      { x: 0, y: 0, type: null },
    ];
    slider.position = this.mousePosition;

    const objectsAtTime = this.hitObjects.hitObjects.filter((it) =>
      almostEquals(it.startTime, slider.startTime, 2),
    );

    for (const object of objectsAtTime) {
      this.submit(new DeleteHitObjectCommand(object), false);
    }

    this.selection.clear();

    this.#slider = this.submit(new CreateHitObjectCommand(slider), false);

    this.#sliderPathVisualizer.slider = this.#slider!;

    this.#path = [...this.#slider!.path.controlPoints];

    this.#segmentStart = 0;
    this.#state = PlacementState.PlacingPoint;
  }

  #endPlacing() {
    this.commit();

    this.selection.select([this.#slider!]);

    this.#slider = undefined;
    this.#path = [];
    this.#segmentStart = 0;
    this.#state = PlacementState.Preview;

    this.#sliderPathVisualizer.slider = null;

    this.#createPreviewCircle();
  }

  #beginPlacingPoint() {
    const slider = this.#slider!;
    const path = this.#path;
    const position = this.mousePosition.sub(slider.stackedPosition);

    if (path.length > 2) {
      const pointBefore = path[path.length - 2];
      if (position.distance(pointBefore) < 5) {
        const newType = this.#sliderUtils.getNextControlPointType(
          path[path.length - 2].type,
          path.length - 2,
        );

        this.#path[path.length - 2].type = newType;

        for (let i = path.length - 1; i >= 1; i--) {
          if (path[i].type !== null) {
            this.#segmentStart = i;
            break;
          }
        }

        this.#sliderUtils.setPath(
          this.#slider!,
          path.slice(0, Math.max(path.length - 1, 2)),
          false,
        );

        return;
      }
    }

    this.#state = PlacementState.DraggingPoint;
  }

  #endPlacingPoint() {
    this.#state = PlacementState.PlacingPoint;

    const position = this.mousePosition.sub(this.#slider!.stackedPosition);

    this.#path = [
      ...this.#slider!.path.controlPoints,
      { x: position.x, y: position.y, type: null },
    ];
  }

  #updateNewCombo(newCombo: boolean) {
    if (this.#previewCircle) {
      this.#previewCircle.isNewCombo = newCombo;
    } else {
      this.submit(new UpdateHitObjectCommand(this.#slider!, { newCombo }));
    }
  }

  dispose(): boolean {
    if (this.#previewCircle) {
      this.hitObjects.remove(this.#previewCircle);
      this.#previewCircle = undefined;
    }

    if (this.#state !== PlacementState.Preview) {
      this.commit();
    }

    return super.dispose();
  }
}

const enum PlacementState {
  Preview,
  PlacingPoint,
  DraggingPoint,
}
