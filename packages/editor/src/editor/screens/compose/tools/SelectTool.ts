import { ComposeTool } from './ComposeTool';
import {
  ClickEvent,
  DragStartEvent,
  MouseButton,
  MouseDownEvent,
  Vec2,
} from 'osucad-framework';
import { SelectBoxInteraction } from './interactions/SelectBoxInteraction';
import { HitObject } from '@osucad/common';
import { MoveSelectionInteraction } from './interactions/MoveSelectionInteraction';

export class SelectTool extends ComposeTool {
  constructor() {
    super();
  }

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
}
