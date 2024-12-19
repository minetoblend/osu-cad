import type {
  DragStartEvent,
  MouseDownEvent,
  MouseMoveEvent,
} from 'osucad-framework';
import type { SliderShape } from './sliderShapes/SliderShape';
import { DeleteHitObjectCommand, PathPoint, PathType, Slider, UpdateHitObjectCommand } from '@osucad/common';
import {
  dependencyLoader,
  MouseButton,
  Vec2,
} from 'osucad-framework';
import { Editor } from '../../../Editor';
import { DistanceSnapProvider } from './DistanceSnapProvider';
import { DrawableHitObjectPlacementTool } from './DrawableHitObjectPlacementTool';
import { SliderPathVisualizer } from './SliderPathVisualizer';
import { SliderUtils } from './SliderUtils';

export abstract class DrawableSliderShapeTool<T extends SliderShape> extends DrawableHitObjectPlacementTool<Slider> {
  protected sliderPathVisualizer = new SliderPathVisualizer();

  protected sliderUtils!: SliderUtils;

  @dependencyLoader()
  load() {
    const distanceSnapProvider = new DistanceSnapProvider();

    this.sliderUtils = new SliderUtils(
      this.commandManager,
      distanceSnapProvider,
    );

    this.addAll(this.sliderPathVisualizer, distanceSnapProvider);

    this.sliderPathVisualizer.onHandleMouseDown = this.#onHandleMouseDown;
    this.sliderPathVisualizer.onHandleDragStarted = this.#onHandleDragStarted;
    this.sliderPathVisualizer.onHandleDragged = this.#onHandleDragged;
    this.sliderPathVisualizer.onHandleDragEnded = this.#onHandleDragEnded;
  }

  createObject(): Slider {
    const slider = new Slider();

    slider.position = this.getSnappedPosition(this.mousePosition);
    slider.startTime = this.snappedTime;
    slider.newCombo = this.newCombo.value;

    slider.path.controlPoints = [
      new PathPoint(Vec2.zero(), PathType.Bezier),
      new PathPoint(Vec2.zero()),
    ];

    slider.hitSound = this.hitSoundState.asHitSound();
    slider.hitSounds = [slider.hitSound, slider.hitSound];

    return slider;
  }

  protected onPlacementStart(hitObject: Slider) {
    super.onPlacementStart(hitObject);

    this.isPlacingEnd = true;
    this.sliderPathVisualizer.slider = hitObject;

    this.shape = this.createSliderShape();
  }

  abstract createSliderShape(): T;

  isPlacingEnd = false;

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      if (!this.isPlacing) {
        this.beginPlacing();
        return true;
      }
      else if (this.isPlacingEnd) {
        this.isPlacingEnd = false;
        return true;
      }

      const hovered = this.hoveredHitObjects(e.mousePosition);

      const toSelect = this.getSelectionCandidate(hovered)!;

      if (toSelect) {
        this.selection.select([toSelect]);
      }

      this.finishPlacing();
    }
    else if (e.button === MouseButton.Right) {
      if (!this.isPlacing) {
        this.newCombo.value = !this.newCombo.value;
      }
      else if (this.isPlacingEnd) {
        this.isPlacingEnd = false;
      }
      else {
        const hovered = this.hoveredHitObjects(e.mousePosition);

        const toDelete = this.getSelectionCandidate(hovered)!;

        if (toDelete) {
          this.submit(new DeleteHitObjectCommand(toDelete), true);
        }

        this.finishPlacing();
      }
    }

    return false;
  }

  #shape!: T;

  get shape() {
    return this.#shape;
  }

  set shape(value: T) {
    if (this.shape === value)
      return;

    if (this.#shape)
      this.remove(this.#shape);
    this.add(value);

    this.#shape = value;
  }

  onMouseMove(e: MouseMoveEvent): boolean {
    if (!this.isPlacing)
      return false;

    if (this.isPlacingEnd) {
      this.shape.endPosition = e.mousePosition;

      this.updatePath();
    }

    return true;
  }

  updatePath() {
    const points = this.shape.createPathPoints();

    this.hitObject.sliderVelocityOverride = null;

    this.sliderUtils.setPath(this.hitObject, points, false);

    let velocity = (this.hitObject.sliderVelocity / this.hitObject.baseVelocity);

    if (this.hitObject.path.expectedDistance > 0) {
      velocity *= this.hitObject.path.calculatedDistance / this.hitObject.path.expectedDistance;
    }

    this.submit(
      new UpdateHitObjectCommand(this.hitObject, {
        position: this.shape.startPosition,
        velocityOverride: velocity,
        expectedDistance: this.hitObject.path.calculatedDistance,
      }),
      false,
    );
  }

  #onHandleMouseDown = () => !this.isPlacingEnd;

  #onHandleDragStarted = (_: number, e: DragStartEvent) => {
    return e.button === MouseButton.Left;
  };

  #onHandleDragged = (index: number, e: DragStartEvent) => {
    const position = this.toLocalSpace(e.screenSpaceMousePosition);

    this.shape.setPosition(index, position);

    this.updatePath();

    return true;
  };

  #onHandleDragEnded = () => {
    this.commit();
  };

  finishPlacing() {
    this.commit();
    this.findClosestParentOfType(Editor)?.requestSelectTool?.emit();
  }

  protected override applyNewComboState(newCombo: boolean) {
    super.applyNewComboState(newCombo);

    if (this.isPlacing) {
      this.submit(new UpdateHitObjectCommand(this.hitObject, { newCombo }), false);
    }
  }
}
