import type { Drawable, MouseDownEvent, MouseMoveEvent, MouseUpEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import { Toggle } from '@osucad/editor/userInterface/Toggle';
import { Anchor, Axes, BindableBoolean, FillFlowContainer, MouseButton, Vec2 } from 'osucad-framework';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../OsucadColors';
import { PathPoint } from '../hitObjects/PathPoint';
import { PathType } from '../hitObjects/PathType';
import { Slider } from '../hitObjects/Slider';
import { SliderPathBuilder } from '../hitObjects/SliderPathBuilder';
import { DrawableOsuHitObjectPlacementTool } from './DrawableOsuHitObjectPlacementTool';
import { SliderPathVisualizer } from './SliderPathVisualizer';

export class DrawableSliderPlacementTool extends DrawableOsuHitObjectPlacementTool<Slider> {
  readonly controlPointSnapping = new BindableBoolean(false);

  override createSettings(): Drawable {
    return new FillFlowContainer({
      relativeSizeAxes: Axes.Both,
      spacing: new Vec2(4),
      children: [
        new OsucadSpriteText({
          text: 'Snap Controlpoints',
          fontSize: 14,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
          color: OsucadColors.text,
        }),
        new Toggle({
          bindable: this.controlPointSnapping,
        }).with({
          scale: 0.65,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }),
      ],
    });
  }

  path = new SliderPathBuilder([
    new PathPoint(new Vec2(), PathType.Bezier),
    new PathPoint(new Vec2()),
  ]);

  #sliderPathVisualizer = new SliderPathVisualizer();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.#sliderPathVisualizer);
  }

  protected override endPlacement() {
    super.endPlacement();

    this.path = new SliderPathBuilder([
      new PathPoint(new Vec2(), PathType.Bezier),
      new PathPoint(new Vec2()),
    ]);
  }

  protected override createHitObject(): Slider {
    return this.#sliderPathVisualizer.slider = new Slider();
  }

  override update() {
    super.update();

    if (!this.isPlacing) {
      this.hitObject.position = this.snappedMousePosition;
      this.hitObject.startTime = this.editorClock.currentTime;
    }
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      if (!this.isPlacing)
        this.beginPlacement();
      else
        this.beginPlacingPathPoint();
    }
    else if (e.button === MouseButton.Right) {
      if (!this.isPlacing) {
        this.hitObject.newCombo = !this.hitObject.newCombo;
      }
      else {
        this.endPlacement();
      }
    }

    return true;
  }

  override onMouseUp(e: MouseUpEvent): boolean {
    if (e.button === MouseButton.Left) {
      if (this.isPlacing && this.isPlacingPoint) {
        this.endPlacingPoint();
        return true;
      }
    }

    return false;
  }

  protected isPlacingPoint = false;

  endPlacingPoint() {
    const position = this.mousePosition.sub(this.hitObject.stackedPosition);

    this.path.setPath([
      ...this.hitObject.path.controlPoints,
      new PathPoint(position),
    ]);

    this.isPlacingPoint = false;
  }

  beginPlacingPathPoint() {
    this.isPlacingPoint = true;

    const position = this.controlPointPlacementPosition;

    if (this.path.length > 2) {
      const pointBefore = this.path.get(-2);
      if (position.distance(pointBefore) < 5) {
        const newType = this.getNextControlPointType(
          this.path.get(-2).type,
          this.path.length - 2,
        );

        this.path.setType(-2, newType);

        this.hitObject.controlPoints = this.path.controlPoints.slice(0, Math.max(this.path.length - 1, 2));
        this.hitObject.expectedDistance = this.#findSnappedDistance(this.hitObject);
      }
    }
  }

  getNextControlPointType(
    currentType: PathType | null,
    index: number,
  ): PathType | null {
    let newType: PathType | null = null;

    switch (currentType) {
      case null:
        newType = PathType.Bezier;
        break;
      case PathType.Bezier:
        newType = PathType.PerfectCurve;
        break;
      case PathType.PerfectCurve:
        newType = PathType.Linear;
        break;
      case PathType.Linear:
        newType = PathType.Catmull;
        break;
      case PathType.Catmull:
        newType = null;
        break;
    }

    if (index === 0 && newType === null) {
      newType = PathType.Bezier;
    }

    return newType;
  }

  get controlPointPlacementPosition() {
    const position = this.controlPointSnapping.value
      ? this.snappedMousePosition
      : this.mousePosition;

    console.log('snapping', this.controlPointSnapping.value);

    return position.sub(this.hitObject.stackedPosition);
  }

  override onMouseMove(e: MouseMoveEvent): boolean {
    if (this.isPlacing) {
      const position = this.controlPointPlacementPosition;

      const segmentStartType = this.path.get(this.segmentStart).type;
      const snapped = position.distance(this.path.get(-2)) < 5;

      if (!snapped)
        this.path.set(-1, new PathPoint(position));

      const segmentLength = this.segmentLength + (snapped ? -1 : 0);

      switch (segmentLength) {
        case 3:
          if (segmentStartType === PathType.Bezier)
            this.path.setType(this.segmentStart, PathType.PerfectCurve);
          break;
        case 4:
          if (segmentStartType === PathType.PerfectCurve)
            this.path.setType(this.segmentStart, PathType.Bezier);
      }

      this.hitObject.controlPoints
          = snapped
          ? this.path.controlPoints.slice(0, Math.max(this.path.length - 1, 2))
          : this.hitObject.controlPoints = this.path.controlPoints;
      this.hitObject.expectedDistance = this.#findSnappedDistance(this.hitObject);
    }

    return true;
  }

  #findSnappedDistance(referenceObject: Slider): number {
    const length = referenceObject!.path.calculatedDistance;
    const duration = Math.ceil(length / referenceObject!.sliderVelocity);
    let time = this.controlPointInfo.snap(
      // adding a tiny bit of length to make up for precision errors shortening the slider
      Math.ceil(referenceObject!.startTime + duration) + 1,
      this.editorClock.beatSnapDivisor.value,
      false,
    );

    if (time > referenceObject.startTime + duration) {
      const beatLength = this.controlPointInfo.timingPointAt(referenceObject.startTime).beatLength;

      time -= beatLength / this.editorClock.beatSnapDivisor.value;
    }

    return Math.max(0, referenceObject!.sliderVelocity * (time - referenceObject!.startTime));
  }

  protected get segmentStart() {
    const index = this.path.controlPoints.findLastIndex(it => it.type !== null);
    if (index < 0)
      return 0;

    return index;
  }

  protected get segmentLength() {
    return this.path.length - this.segmentStart;
  }
}
