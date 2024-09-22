import type { KeyDownEvent, Vec2 } from 'osucad-framework';
import type { OsuHitObject } from '../../../../beatmap/hitObjects/OsuHitObject';
import type { HitSoundState } from '../../../../beatmap/hitSounds/BindableHitSound.ts';
import type { CommandProxy } from '../../../commands/CommandProxy';
import { almostEquals, Key, resolved } from 'osucad-framework';
import { HitCircle } from '../../../../beatmap/hitObjects/HitCircle';
import { CreateHitObjectCommand } from '../../../commands/CreateHitObjectCommand';
import { DeleteHitObjectCommand } from '../../../commands/DeleteHitObjectCommand';
import { Editor } from '../../../Editor.ts';
import { OsuPlayfield } from '../../../hitobjects/OsuPlayfield';
import { HITSOUND } from '../../../InjectionTokens.ts';
import { DrawableComposeTool } from './DrawableComposeTool';

enum PlacementState {
  Preview,
  Placing,
}

export abstract class DrawableHitObjectPlacementTool<T extends OsuHitObject> extends DrawableComposeTool {
  #hitObject?: CommandProxy<T>;

  #previewObject?: OsuHitObject;

  #state = PlacementState.Preview;

  @resolved(HITSOUND)
  protected hitSoundState!: HitSoundState;

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
      this.editorClock.currentTimeBindable.addOnChangeListener((e) => {
        if (this.#previewObject) {
          this.#previewObject.startTime = e.value;
        }
      });
    });
  }

  @resolved(OsuPlayfield)
  protected playfield!: OsuPlayfield;

  protected createPreviewObject() {
    const circle = new HitCircle();

    circle.position = this.clampToPlayfieldBounds(this.mousePosition);
    circle.startTime = this.editorClock.currentTime;
    circle.synthetic = true;

    circle.startTimeBindable.addOnChangeListener(() => {
      circle.applyDefaults(this.beatmap.controlPoints, this.beatmap.difficulty);
    }, { immediate: true });

    this.beatmap.hitObjects.add(circle);

    this.#previewObject = circle;

    return circle;
  }

  abstract createObject(): T;

  beginPlacing() {
    if (this.#state === PlacementState.Placing)
      return;

    this.#state = PlacementState.Placing;

    if (this.#previewObject) {
      this.beatmap.hitObjects.remove(this.#previewObject);
      this.#previewObject = undefined;
      this.playfield.updateSubTree();
    }

    const object = this.createObject();

    const objectsAtTime = this.hitObjects.filter(it => almostEquals(it.startTime, object.startTime, 2));

    for (const h of objectsAtTime) {
      this.submit(new DeleteHitObjectCommand(h), false);
    }

    this.submit(
      new CreateHitObjectCommand(object),
      false,
    );

    const created = this.hitObjects.getById(object.id);
    console.assert(created !== undefined, 'HitObject was not created');

    this.#hitObject = this.createProxy(created!);

    this.playfield.updateSubTree();

    this.onPlacementStart(this.#hitObject!);
  }

  protected onPlacementStart(hitObject: CommandProxy<T>) {
  }

  protected onPlacementFinish(hitObject: CommandProxy<T>) {
  }

  finishPlacing() {
    if (this.#state !== PlacementState.Placing)
      return;

    this.onPlacementFinish(this.#hitObject!);

    this.commit();

    this.#hitObject = undefined;

    this.#state = PlacementState.Preview;
    this.createPreviewObject();

    this.newCombo.value = false;
  }

  update() {
    super.update();

    if (this.#previewObject) {
      const position = this.getSnappedPosition(this.mousePosition);
      if (!position.equals(this.#previewObject.position))
        this.#previewObject.position = position;
    }
  }

  protected override applyNewComboState(newCombo: boolean): void {
    if (this.#previewObject) {
      this.#previewObject.newCombo = newCombo;
    }
  }

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

  dispose(disposing: boolean = true) {
    if (this.#previewObject) {
      this.beatmap.hitObjects.remove(this.#previewObject);
      this.#previewObject = undefined;
    }

    if (this.isPlacing) {
      this.commit();
    }

    super.dispose(disposing);
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.Escape) {
      this.finishPlacing();

      this.findClosestParentOfType(Editor)?.requestSelectTool.emit();

      return true;
    }

    return false;
  }
}
