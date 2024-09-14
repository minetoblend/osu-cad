import type { DragEvent, DragStartEvent, MouseUpEvent, Vec2 } from 'osucad-framework';
import { dependencyLoader, MouseButton, resolved } from 'osucad-framework';
import { SliderUtils } from '../SliderUtils';
import { DistanceSnapProvider } from '../DistanceSnapProvider';
import { PathPoint } from '../../../../../beatmap/hitObjects/PathPoint';
import type { Slider } from '../../../../../beatmap/hitObjects/Slider';
import { ComposeToolInteraction } from './ComposeToolInteraction';
import { PathType } from '../../../../../beatmap/hitObjects/PathType.ts';

export class InsertControlPointInteraction extends ComposeToolInteraction {
  constructor(
    readonly slider: Slider,
    readonly startPosition: Vec2,
    readonly index: number,
  ) {
    super();
  }

  #sliderUtils!: SliderUtils;

  @resolved(DistanceSnapProvider)
  private distanceSnapProvider!: DistanceSnapProvider;

  @dependencyLoader()
  load() {
    this.#sliderUtils = new SliderUtils(
      this.commandManager,
      this.distanceSnapProvider,
    );

    const path = [...this.slider.path.controlPoints];
    path.splice(this.index, 0, new PathPoint(this.startPosition));

    if (path.length === 3) {
      path[0] = path[0].withType(PathType.PerfectCurve);
    }

    this.#sliderUtils.setPath(this.slider, path);
  }

  onDragStart(e: DragStartEvent): boolean {
    return e.button === MouseButton.Left;
  }

  onDrag(e: DragEvent): boolean {
    const position = e.mousePosition.sub(this.slider.stackedPosition);

    const path = [...this.slider.path.controlPoints];
    path[this.index] = path[this.index].withPosition(position);

    this.#sliderUtils.setPath(this.slider, path);

    return true;
  }

  onMouseUp(e: MouseUpEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.complete();
      return true;
    }

    return false;
  }
}
