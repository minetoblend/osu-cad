import type { Additions, HitObject } from '@osucad/common';
import { CreateHitObjectCommand, DeleteHitObjectCommand, HitCircle } from '@osucad/common';
import type { Bindable, Vec2 } from 'osucad-framework';
import { almostEquals } from 'osucad-framework';
import { DrawableComposeTool } from './DrawableComposeTool';

enum PlacementState {
  Preview,
  Placing,
}

export abstract class DrawableHitObjectPlacementTool<T extends HitObject> extends DrawableComposeTool {
  #hitObject?: T;

  #previewObject?: HitObject;

  #state = PlacementState.Preview;

  get isPlacing() {
    return this.#state === PlacementState.Placing;
  }

  protected get hitObject() {
    if (!this.#hitObject)
      throw new Error('Cannot access hitObject when not in placing state');

    return this.#hitObject;
  }

  protected loadComplete() {
    super.loadComplete();

    this.createPreviewObject();

    this.withScope(() => {
      this.editorClock.currentTimeBindable.addOnChangeListener((time) => {
        if (this.#previewObject) {
          this.#previewObject.startTime = time;
        }
      });
    });
  }

  protected createPreviewObject() {
    const circle = new HitCircle();

    circle.position = this.clampToPlayfieldBounds(this.mousePosition);
    circle.startTime = this.editorClock.currentTime;
    circle.isGhost = true;

    this.hitObjects.add(circle);

    this.#previewObject = circle;

    return circle;
  }

  abstract createObject(): T;

  beginPlacing() {
    if (this.#state === PlacementState.Placing)
      return;

    this.#state = PlacementState.Placing;

    if (this.#previewObject) {
      this.hitObjects.remove(this.#previewObject);
      this.#previewObject = undefined;
    }

    const object = this.createObject();

    const objectsAtTime = this.hitObjects.hitObjects.filter(it => almostEquals(it.startTime, object.startTime, 2));

    for (const h of objectsAtTime) {
      this.submit(new DeleteHitObjectCommand(h), false);
    }

    this.#hitObject = this.submit(
      new CreateHitObjectCommand(object),
      false,
    );

    if (!this.#hitObject) {
      throw new Error('No HitObject created');
    }

    this.onPlacementStart(this.#hitObject);
  }

  protected onPlacementStart(hitObject: T) {
  }

  finishPlacing() {
    if (this.#state !== PlacementState.Placing)
      return;

    this.commit();

    this.#hitObject = undefined;

    this.#state = PlacementState.Preview;
    this.createPreviewObject();
  }

  update() {
    super.update();

    if (this.#previewObject) {
      this.#previewObject.position = this.clampToPlayfieldBounds(this.mousePosition);
    }
  }

  applyNewCombo(newCombo: boolean): void {
    console.log('applyNewCombo', newCombo);
    if (this.#previewObject) {
      this.#previewObject.isNewCombo = newCombo;
    }
  }

  abstract applySampleType(addition: Additions, bindable: Bindable<boolean>): void;

  getSnappedPosition(position: Vec2) {
    const snapResult = this.composer.snapHitObjectPosition([position]);

    if (snapResult.offset) {
      position = position.add(snapResult.offset);
    }

    return this.clampToPlayfieldBounds(position);
  }

  get snappedTime() {
    return this.beatmap.controlPoints.snap(this.editorClock.currentTime, this.editorClock.beatSnapDivisor.value);
  }

  dispose(): boolean {
    if (this.#previewObject) {
      this.hitObjects.remove(this.#previewObject);
      this.#previewObject = undefined;
    }

    if (this.isPlacing) {
      this.commit();
    }

    return super.dispose();
  }
}
