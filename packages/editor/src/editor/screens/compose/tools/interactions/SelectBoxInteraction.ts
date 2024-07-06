import { ComposeToolInteraction } from './ComposeToolInteraction';
import {
  dependencyLoader,
  Key,
  KeyDownEvent,
  KeyUpEvent,
  MouseButton,
  MouseMoveEvent,
  MouseUpEvent,
  Rectangle,
  resolved,
  RoundedBox,
  Vec2,
} from 'osucad-framework';
import { EditorSelection } from '../../EditorSelection';
import { HitObject, HitObjectManager, Slider, Spinner } from '@osucad/common';
import { EditorClock } from '../../../../EditorClock';

export class SelectBoxInteraction extends ComposeToolInteraction {
  constructor(readonly startPosition: Vec2) {
    super();
  }

  #selectionAtStart: HitObject[] = [];

  @dependencyLoader()
  load() {
    this.#selectionAtStart = this.selection.selectedObjects;
    this.selection.clear();

    this.#startTime = this.editorClock.currentTime;
    this.#endTime = this.editorClock.currentTime;

    this.#rect = new Rectangle(
      this.startPosition.x,
      this.startPosition.y,
      0,
      0,
    );

    this.add(
      (this.#selectBox = new RoundedBox({
        cornerRadius: 1,
        fillAlpha: 0.1,
        width: 0,
        height: 0,
        outline: {
          width: 1,
          color: this.theme.primary,
          alpha: 1,
        },
      })),
    );
  }

  #selectBox!: RoundedBox;

  @resolved(EditorSelection)
  selection!: EditorSelection;

  @resolved(HitObjectManager)
  hitObjects!: HitObjectManager;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #startTime = 0;
  #endTime = 0;

  #rect!: Rectangle;

  #controlPressed = false;

  onMouseMove(e: MouseMoveEvent): boolean {
    const min = this.startPosition.componentMin(e.mousePosition);
    const max = this.startPosition.componentMax(e.mousePosition);

    this.#rect = new Rectangle(min.x, min.y, max.x - min.x, max.y - min.y);

    this.#selectBox.position = min;
    this.#selectBox.size = max.sub(min);

    this.#controlPressed = e.controlPressed;

    this.#updateSelection();

    return true;
  }

  update() {
    super.update();

    this.#updateSelection();
  }

  #updateSelection() {
    this.#endTime = this.editorClock.currentTime;

    const minTime = Math.min(this.#startTime, this.#endTime);
    const maxTime = Math.max(this.#startTime, this.#endTime);

    const hitObjects = this.hitObjects.hitObjects.filter((it) => {
      if (it instanceof Spinner) {
        return false;
      }

      if (
        maxTime < it.startTime - it.timePreempt ||
        minTime > it.endTime + 700
      ) {
        return false;
      }

      if (
        it instanceof Slider &&
        this.#rect.contains(it.stackedPosition.add(it.path.endPosition))
      ) {
        return true;
      }

      return this.#rect.contains(it.stackedPosition);
    });

    if (this.#controlPressed) {
      hitObjects.push(...this.#selectionAtStart);
    }

    this.selection.select(hitObjects);
  }

  onMouseUp(e: MouseUpEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.complete();
      return true;
    }

    return false;
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.ControlLeft || e.key === Key.ControlRight) {
      this.#controlPressed = true;
      this.#updateSelection();
      return true;
    }

    return false;
  }

  onKeyUp(e: KeyUpEvent): boolean {
    if (e.key === Key.ControlLeft || e.key === Key.ControlRight) {
      this.#controlPressed = false;
      this.#updateSelection();
      return true;
    }

    return false;
  }
}
