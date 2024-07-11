import {
  Additions,
  CreateHitObjectCommand,
  DeleteHitObjectCommand,
  HitCircle,
  hitObjectId,
  setAdditionsEnabled,
  UpdateHitObjectCommand,
} from '@osucad/common';
import {
  almostEquals,
  Bindable,
  dependencyLoader,
  DragEvent,
  DragStartEvent,
  MouseButton,
  MouseDownEvent,
  MouseMoveEvent,
  MouseUpEvent,
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
    this.newCombo.value = false;

    this.editorClock.currentTimeBindable.addOnChangeListener(() => {
      if (this.#hitObject) {
        this.#updateHitObjectTime();
      }
    });
  }

  override applyNewCombo(newCombo: boolean): void {
    if (this.#state === PlacementState.Placing) {
      this.submit(
        new UpdateHitObjectCommand(this.#hitObject, { newCombo }),
        false,
      );
    } else if (this.#hitObject) {
      this.#hitObject.isNewCombo = newCombo;
    }
  }

  applySampleType(addition: Additions, bindable: Bindable<boolean>): void {
    // no-op
  }

  protected loadComplete(): void {
    super.loadComplete();

    this.#createPreviewCircle();
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
    circle.position = this.clampToPlayfieldBounds(this.mousePosition);
    circle.startTime = this.editorClock.currentTime;

    this.hitObjects.add(circle);

    this.#hitObject = circle;

    this.#state = PlacementState.Preview;

    this.newCombo.value = false;
  }

  onMouseMove(e: MouseMoveEvent): boolean {
    this.#updateObject((object) => {
      object.position = this.clampToPlayfieldBounds(this.mousePosition);
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

      hitObject.startTime = this.beatmap.controlPoints.snap(
        this.editorClock.currentTime,
        this.beatSnapDivisor,
      );

      const existing = this.hitObjects.hitObjects.filter((it) =>
        almostEquals(it.startTime, hitObject.startTime, 2),
      );

      for (const object of existing) {
        this.submit(new DeleteHitObjectCommand(object), false);
      }

      let additions = Additions.None;
      if (this.sampleWhistle.value) additions |= Additions.Whistle;
      if (this.sampleFinish.value) additions |= Additions.Finish;
      if (this.sampleClap.value) additions |= Additions.Clap;

      hitObject.hitSound.additions = additions;

      hitObject.id = hitObjectId();

      this.#hitObject = this.submit(
        new CreateHitObjectCommand(hitObject),
        false,
      )!;

      this.selection.select([this.#hitObject]);

      return false;
    }

    if (e.button === MouseButton.Right) {
      this.newCombo.value = !this.newCombo.value;
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
        position: this.clampToPlayfieldBounds(e.mousePosition),
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

    return super.dispose();
  }
}

const enum PlacementState {
  Preview,
  Placing,
}
