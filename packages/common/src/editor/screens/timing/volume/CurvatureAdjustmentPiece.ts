import type {
  DragEvent,
  DragStartEvent,
  HoverEvent,
  MouseDownEvent,
} from 'osucad-framework';
import type { VolumePointSelectionBlueprint } from './VolumePointSelectionBlueprint';
import {
  Anchor,
  Axes,
  CompositeDrawable,
  Container,
  dependencyLoader,
  EasingFunction,
  FastRoundedBox,
  MouseButton,
} from 'osucad-framework';
import { VolumeCurveType } from '../../../../controlPoints/VolumePoint';

export class CurvatureAdjustmentPiece extends CompositeDrawable {
  constructor(readonly blueprint: VolumePointSelectionBlueprint) {
    super();

    blueprint.curveTypeBindable.valueChanged.addListener(this.updatePosition, this);
    blueprint.curvatureBindable.valueChanged.addListener(this.updatePosition, this);
    blueprint.volumeBindable.valueChanged.addListener(this.updatePosition, this);
    blueprint.endVolumeBindable.valueChanged.addListener(this.updatePosition, this);
  }

  #scaleContainer!: Container;

  @dependencyLoader()
  [Symbol('load')]() {
    this.width = this.height = 16;
    this.anchor = Anchor.TopCenter;
    this.origin = Anchor.Center;
    this.padding = 4;

    this.relativePositionAxes = Axes.Y;

    this.addAllInternal(
      this.#scaleContainer = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
          new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 6,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            alpha: 0.5,
          }),
          new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 6,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            scale: 0.75,
          }),
        ],
      }),
    );

    this.color = this.blueprint.keyframeColor.value;
  }

  updatePosition() {
    if (this.blueprint.entry?.end && this.blueprint.curveTypeBindable.value === VolumeCurveType.Smooth) {
      this.show();
      const start = this.blueprint.entry!.start;
      const end = this.blueprint.entry!.end!;

      const volume = start.volumeAtTime((start.time + end.time) / 2, end);
      this.y = 1 - volume / 100;
    }
    else {
      this.hide();
    }
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right) {
      this.blueprint.curvatureBindable.value = 0;
      return true;
    }

    return false;
  }

  override onDragStart(e: DragStartEvent): boolean {
    return true;
  }

  override onDrag(e: DragEvent): boolean {
    if (this.blueprint.volumeBindable.value > this.blueprint.endVolumeBindable.value)
      this.blueprint.curvatureBindable.value += e.delta.y * 0.01;
    else
      this.blueprint.curvatureBindable.value -= e.delta.y * 0.01;

    return true;
  }

  override onHover(e: HoverEvent): boolean {
    this.#scaleContainer.scaleTo(1.2, 200, EasingFunction.OutExpo);
    return true;
  }

  override onHoverLost(e: HoverEvent) {
    this.#scaleContainer.scaleTo(1, 200, EasingFunction.OutExpo);
  }
}
