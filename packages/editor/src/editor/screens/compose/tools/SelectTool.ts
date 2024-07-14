import { ComposeTool } from './ComposeTool';
import {
  Anchor,
  Bindable,
  ClickEvent,
  dependencyLoader,
  DragStartEvent,
  InputManager,
  MouseButton,
  MouseDownEvent,
  RoundedBox,
  Vec2,
} from 'osucad-framework';
import { SelectBoxInteraction } from './interactions/SelectBoxInteraction';
import {
  Additions,
  DeleteHitObjectCommand,
  HitObject,
  setAdditionsEnabled,
  Slider,
  UpdateHitObjectCommand,
} from '@osucad/common';
import { MoveSelectionInteraction } from './interactions/MoveSelectionInteraction';
import { SliderPathVisualizer } from './SliderPathVisualizer';
import { DistanceSnapProvider } from './DistanceSnapProvider';
import { SliderUtils } from './SliderUtils';
import { InsertControlPointInteraction } from './interactions/InsertControlPointInteraction';

export class SelectTool extends ComposeTool {
  constructor() {
    super();

    this.addAllInternal(
      this.#sliderPathVisualizer,
      this.#snapProvider,
      this.#sliderInsertPointVisualizer,
    );
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
        if (this.#sliderInsertPoint && this.activeSlider) {
          this.beginInteraction(
            new InsertControlPointInteraction(
              this.activeSlider,
              this.#sliderInsertPoint.position,
              this.#sliderInsertPoint.index,
            ),
          );
          return true;
        }

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
    } else if (e.button === MouseButton.Right) {
      const hovered = this.hoveredHitObjects(e.mousePosition);

      if (hovered.length === 0) {
        return false;
      }

      const candidate = this.#getSelectionCandidate(hovered)!;

      if (candidate.isSelected) {
        for (const object of this.selection.selectedObjects) {
          this.submit(new DeleteHitObjectCommand(object), false);
        }
        this.commit();
      } else {
        this.submit(new DeleteHitObjectCommand(candidate));
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

    this.#updateNewComboFromSelection();

    this.#updateAdditionsFromSelection();

    this.#inputManager ??= this.getContainingInputManager();

    if (this.#inputManager) {
      const hitObjects = this.hoveredHitObjects(
        this.toLocalSpace(this.#inputManager.currentState.mouse.position),
      );

      this.#updateSliderPathVisualizer(
        hitObjects,
        this.#inputManager.currentState.keyboard.controlPressed,
      );
    }
  }

  #updateSliderPathVisualizer(
    hoveredHitObjects: HitObject[],
    controlPressed: boolean,
  ) {
    if (this.#isDragging) {
      return;
    }

    let slider: Slider | null = null;

    const selection = this.selection.selectedObjects;
    if (selection.length === 1 && selection[0] instanceof Slider) {
      slider = selection[0];
    } else if (hoveredHitObjects.every((it) => !it.isSelected)) {
      slider = (hoveredHitObjects.find((it) => it instanceof Slider) ??
        null) as Slider | null;
    }

    this.activeSlider = slider;

    if (slider && controlPressed) {
      this.#sliderInsertPoint = this.#sliderUtils.getInsertPoint(
        slider,
        this.mousePosition,
      );
    } else {
      this.#sliderInsertPoint = null;
    }

    if (this.#sliderInsertPoint) {
      this.#sliderInsertPointVisualizer.alpha = 1;
      this.#sliderInsertPointVisualizer.position = slider!.stackedPosition.add(
        this.#sliderInsertPoint.position,
      );
    } else {
      this.#sliderInsertPointVisualizer.alpha = 0;
    }
  }

  #sliderInsertPoint: { position: Vec2; index: number } | null = null;

  #sliderInsertPointVisualizer: RoundedBox = new RoundedBox({
    width: 6,
    height: 6,
    cornerRadius: 2,
    origin: Anchor.Center,
    alpha: 0,
  });

  @dependencyLoader()
  load() {
    this.#sliderUtils = new SliderUtils(
      this.commandManager,
      this.#snapProvider,
    );

    this.dependencies.provide(this.#snapProvider);

    this.#sliderPathVisualizer.onHandleMouseDown = this.#onHandleMouseDown;
    this.#sliderPathVisualizer.onHandleDragStarted = this.#onHandleDragStarted;
    this.#sliderPathVisualizer.onHandleDragged = this.#onHandleDragged;
    this.#sliderPathVisualizer.onHandleDragEnded = this.#onHandleDragEnded;
  }

  applyNewCombo(newCombo: boolean): void {
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
  }

  applySampleType(addition: Additions, bindable: Bindable<boolean>): void {
    if (this.selection.length === 0) {
      return;
    }

    const hitObjects = this.selection.selectedObjects;

    for (const hitObject of hitObjects) {
      this.submit(
        new UpdateHitObjectCommand(hitObject, {
          hitSound: {
            ...hitObject.hitSound,
            additions: setAdditionsEnabled(
              hitObject.hitSound.additions,
              addition,
              bindable.value,
            ),
          },
        }),
        false,
      );
    }

    this.commit();
  }

  #isDragging = false;

  #isCycleControlPointEvent(e: MouseDownEvent) {
    if (navigator.userAgent.includes('Mac')) {
      return e.metaPressed;
    }

    return e.controlPressed;
  }

  #onHandleMouseDown = (index: number, e: MouseDownEvent) => {
    const slider = this.activeSlider!;

    if (e.button === MouseButton.Right) {
      this.#sliderUtils.deleteControlPoint(slider, index);
      return true;
    }

    if (e.button === MouseButton.Left && this.#isCycleControlPointEvent(e)) {
      this.#sliderUtils.cycleControlPointType(slider, index);
      return false;
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
    const slider = this.activeSlider!;

    const position = this.toLocalSpace(e.screenSpaceMousePosition);

    this.#sliderUtils.moveControlPoint(slider, index, position, false);

    return true;
  };

  #onHandleDragEnded = () => {
    this.commit();
    this.#isDragging = false;
  };

  #updateNewComboFromSelection() {
    if (this.selection.length === 0) {
      this.newCombo.value = false;
      return;
    }
    this.newCombo.value = this.selection.selectedObjects.every(
      (it) => it.isNewCombo || it === this.hitObjects.first,
    );
  }

  #updateAdditionsFromSelection() {
    if (this.selection.length === 0) {
      return;
    }

    for (const addition of [
      Additions.Whistle,
      Additions.Finish,
      Additions.Clap,
    ]) {
      const allActive = this.selection.selectedObjects.every(
        (it) => !!(it.hitSound.additions & addition),
      );

      let bindable: Bindable<boolean>;

      switch (addition) {
        case Additions.Whistle:
          bindable = this.sampleWhistle;
          break;
        case Additions.Finish:
          bindable = this.sampleFinish;
          break;
        case Additions.Clap:
          bindable = this.sampleClap;
          break;
      }

      bindable!.value = allActive;
    }
  }

  get activeSlider() {
    return this.#sliderPathVisualizer.slider;
  }

  set activeSlider(value: Slider | null) {
    this.#sliderPathVisualizer.slider = value;
  }
}
