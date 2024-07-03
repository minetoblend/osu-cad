import {
  CreateHitObjectCommand,
  DeleteHitObjectCommand,
  HitCircle,
  hitObjectId,
  UpdateHitObjectCommand,
} from '@osucad/common';
import {
  almostEquals,
  clamp,
  dependencyLoader,
  DragEvent,
  DragStartEvent,
  MouseButton,
  MouseDownEvent,
  MouseMoveEvent,
  MouseUpEvent,
  Vec2,
} from 'osucad-framework';
import { ComposeTool } from './ComposeTool';

export class HitCircleTool extends ComposeTool {
  constructor() {
    super();
  }

  #state: PlacementState = PlacementState.Preview;

  #hitObject!: HitCircle;

  @dependencyLoader()
  load() {
    this.editorClock.currentTimeBindable.addOnChangeListener(() => {
      if (this.#hitObject) {
        this.#updateHitObjectTime();
      }
    });
  }

  update(): void {
    super.update();

    if (!this.#hitObject) {
      this.#createPreviewCircle();
    }
  }

  #updateHitObjectTime() {
    let time = this.editorClock.currentTime;

    if (this.#state === PlacementState.Placing) {
      time = this.beatmap.controlPoints.snap(time, this.beatSnapDivisor);
    }

    this.#updateObject((object) => (object.startTime = time));
  }

  #updateObject(fn: (object: HitCircle) => void) {
    if (this.#state === PlacementState.Preview) {
      fn(this.#hitObject);
    } else {
      this.#hitObject.update(this.commandManager, fn, false);
    }
  }

  #createPreviewCircle() {
    const circle = new HitCircle();
    circle.position = this.#clampToPlayfieldBounds(this.mousePosition);
    circle.startTime = this.editorClock.currentTime;

    this.hitObjects.add(circle);

    this.#hitObject = circle;

    this.#state = PlacementState.Preview;
  }

  onMouseMove(e: MouseMoveEvent): boolean {
    this.#updateObject((object) => {
      object.position = this.#clampToPlayfieldBounds(this.mousePosition);
    });

    return false;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    console.assert(
      this.#state === PlacementState.Preview,
      'Expected to be in pewview state on mouse down',
    );

    if (e.button === MouseButton.Left) {
      const hitObject = this.#hitObject;

      // Removing the object before we readd it through the command manager
      this.hitObjects.remove(hitObject);

      const existing = this.hitObjects.hitObjects.filter((it) =>
        almostEquals(it.startTime, hitObject.startTime, 2),
      );

      for (const object of existing) {
        this.submit(new DeleteHitObjectCommand(object), false);
      }

      hitObject.id = hitObjectId();
      hitObject.startTime = this.beatmap.controlPoints.snap(
        this.editorClock.currentTime,
        this.beatSnapDivisor,
      );

      this.#hitObject = this.submit(
        new CreateHitObjectCommand(hitObject),
        false,
      )!;

      return false;
    }

    if (e.button === MouseButton.Right) {
      this.#updateObject((object) => (object.isNewCombo = !object.isNewCombo));
    }

    return false;
  }

  onMouseUp(e: MouseUpEvent): boolean {
    if (e.button !== MouseButton.Left) return false;

    this.commit();

    this.#createPreviewCircle();

    return true;
  }

  onDragStart(e: DragStartEvent): boolean {
    return e.button === MouseButton.Left;
  }

  onDrag(e: DragEvent): boolean {
    this.submit(
      new UpdateHitObjectCommand(this.#hitObject, {
        position: e.mousePosition,
        startTime: this.beatmap.controlPoints.snap(
          this.editorClock.currentTime,
          this.editorClock.beatSnapDivisor.value,
        ),
      }),
    );

    return true;
  }

  dispose(): boolean {
    this.hitObjects.remove(this.#hitObject);

    return true;
  }

  #clampToPlayfieldBounds(position: Vec2) {
    return new Vec2(clamp(position.x, 0, 512), clamp(position.y, 0, 384));
  }
}

const enum PlacementState {
  Preview,
  Placing,
}
