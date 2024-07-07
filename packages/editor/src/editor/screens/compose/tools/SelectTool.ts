import { ComposeTool } from './ComposeTool';
import {
  ClickEvent,
  dependencyLoader,
  DragStartEvent,
  InputManager,
  MouseButton,
  MouseDownEvent,
  Vec2,
} from 'osucad-framework';
import { SelectBoxInteraction } from './interactions/SelectBoxInteraction';
import { HitObject, Slider, UpdateHitObjectCommand } from '@osucad/common';
import { MoveSelectionInteraction } from './interactions/MoveSelectionInteraction';
import { SliderPathVisualizer } from './SliderPathVisualizer';
import { DistanceSnapProvider } from './DistanceSnapProvider';
import { SliderUtils } from './SliderUtils';

export class SelectTool extends ComposeTool {
  constructor() {
    super();

    this.addAllInternal(this.#sliderPathVisualizer, this.#snapProvider);
  }

  #snapProvider = new DistanceSnapProvider();

  #sliderPathVisualizer = new SliderPathVisualizer();

  #sliderUtils!: SliderUtils;

  get visibleObjects(): HitObject[] {
    return this.hitObjects.hitObjects.filter((it) => {
      if (this.selection.isSelected(it)) return true;

      return it.isVisibleAtTime(this.editorClock.currentTime);
    });
  }

  hoveredHitObjects(position: Vec2) {
    return this.visibleObjects.filter((it) => it.contains(position));
  }

  #getSelectionCandidate(hitObjects: HitObject[]) {
    let min = Infinity;
    let candidate: HitObject | null = null;

    for (const hitObject of hitObjects) {
      const distance = Math.min(
        Math.abs(hitObject.startTime - this.editorClock.currentTime),
        Math.abs(hitObject.endTime - this.editorClock.currentTime),
      );

      if (distance < min) {
        min = distance;
        candidate = hitObject;
      }
    }

    return candidate;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    this.#canCycleSelection = false;

    if (e.button === MouseButton.Left) {
      const hovered = this.hoveredHitObjects(e.mousePosition);

      if (hovered.length === 0) {
        this.beginInteraction(new SelectBoxInteraction(e.mousePosition));
        return true;
      }

      const candidate = this.#getSelectionCandidate(hovered)!;

      if (e.controlPressed) {
        if (
          this.selection.length <= 1 ||
          !this.selection.isSelected(candidate)
        ) {
          this.selection.select([candidate], true);
          return true;
        }

        this.selection.deselect(candidate);
        return true;
      }

      if (!this.selection.isSelected(candidate)) {
        this.selection.select([candidate]);
      } else {
        this.#canCycleSelection = true;
      }

      return true;
    }

    return false;
  }

  onClick(e: ClickEvent): boolean {
    if (e.button === MouseButton.Left && this.#canCycleSelection) {
      this.#cycleSelection(
        this.hoveredHitObjects(
          this.toLocalSpace(
            e.screenSpaceMouseDownPosition ?? e.screenSpaceMousePosition,
          ),
        ),
      );
    }

    return false;
  }

  #canCycleSelection = false;

  #cycleSelection(hitObjects: HitObject[]) {
    const currentSelection = [...this.selection.selectedObjects];
    const index = hitObjects.indexOf(currentSelection[0]);
    if (index !== -1) {
      this.selection.select([hitObjects[(index + 1) % hitObjects.length]]);
    }
  }

  onDragStart(e: DragStartEvent): boolean {
    if (e.button === MouseButton.Left) {
      if (this.selection.length > 0) {
        const hovered = this.hoveredHitObjects(e.mousePosition);
        if (hovered.length === 0) return false;

        const startPosition = this.toLocalSpace(
          e.screenSpaceMouseDownPosition ?? e.screenSpaceMousePosition,
        );

        this.beginInteraction(
          new MoveSelectionInteraction(
            this.selection.selectedObjects,
            startPosition,
          ),
        );
      }
    }

    return false;
  }

  #inputManager: InputManager | null = null;

  update() {
    super.update();

    this.#updateNewCombo();

    this.#inputManager ??= this.getContainingInputManager();

    if (this.#inputManager) {
      const hitObjects = this.hoveredHitObjects(
        this.toLocalSpace(this.#inputManager.currentState.mouse.position),
      );

      this.#updateSliderPathVisualizer(hitObjects);
    }
  }

  #updateSliderPathVisualizer(hoveredHitObjects: HitObject[]) {
    if (this.#isDragging) {
      return;
    }

    const selection = this.selection.selectedObjects;
    if (selection.length === 1 && selection[0] instanceof Slider) {
      this.#sliderPathVisualizer.slider = selection[0];
    } else if (hoveredHitObjects.every((it) => !it.isSelected)) {
      const slider = hoveredHitObjects.find((it) => it instanceof Slider) as
        | Slider
        | undefined;

      this.#sliderPathVisualizer.slider = slider ?? null;
    } else {
      this.#sliderPathVisualizer.slider = null;
    }
  }

  @dependencyLoader()
  load() {
    this.#sliderUtils = new SliderUtils(
      this.commandManager,
      this.#snapProvider,
    );

    this.#sliderPathVisualizer.onHandleMouseDown = this.#onHandleMouseDown;
    this.#sliderPathVisualizer.onHandleDragStarted = this.#onHandleDragStarted;
    this.#sliderPathVisualizer.onHandleDragged = this.#onHandleDragged;
    this.#sliderPathVisualizer.onHandleDragEnded = this.#onHandleDragEnded;

    this.newCombo.addOnChangeListener((newCombo) => {
      const objects = this.selection.selectedObjects;
      if (objects.length === 0) return;

      const allNewCombo = objects.every(
        (it) => it.isNewCombo || it === this.hitObjects.first,
      );
      if (allNewCombo !== newCombo) {
        for (const object of objects) {
          this.commandManager.submit(
            new UpdateHitObjectCommand(object, {
              newCombo,
            }),
          );
        }
      }
    });
  }

  #isDragging = false;

  #isCycleControlPointEvent(e: MouseDownEvent) {
    if (navigator.userAgent.includes('Mac')) {
      return e.metaPressed;
    }

    return e.controlPressed;
  }

  #onHandleMouseDown = (index: number, e: MouseDownEvent) => {
    const slider = this.#sliderPathVisualizer.slider!;

    if (e.button === MouseButton.Right) {
      this.#sliderUtils.deleteControlPoint(slider, index);
      return true;
    }

    if (e.button === MouseButton.Left && this.#isCycleControlPointEvent(e)) {
      this.#sliderUtils.cycleControlPointType(slider, index);
      return true;
    }

    if (!slider.isSelected) {
      this.selection.select([slider]);
    }

    return true;
  };

  #onHandleDragStarted = (_: number, e: DragStartEvent) => {
    if (e.button === MouseButton.Left) {
      this.#isDragging = true;
      return true;
    }
    return false;
  };

  #onHandleDragged = (index: number, e: DragStartEvent) => {
    const slider = this.#sliderPathVisualizer.slider!;

    const position = this.toLocalSpace(e.screenSpaceMousePosition);

    this.#sliderUtils.moveControlPoint(slider, index, position, false);

    return true;
  };

  #onHandleDragEnded = () => {
    this.commit();
    this.#isDragging = false;
  };

  #updateNewCombo() {
    if (this.selection.length === 0) {
      this.newCombo.value = false;
      return;
    }
    this.newCombo.value = this.selection.selectedObjects.every(
      (it) => it.isNewCombo || it === this.hitObjects.first,
    );
  }
}
