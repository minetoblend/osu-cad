import type { OsuHitObject } from '../../../../beatmap/hitObjects/OsuHitObject.ts';
import {
  Axes,
  BindableBoolean,
  clamp,
  dependencyLoader,
  EasingFunction,
  resolved,
  Vec2,
  VisibilityContainer,
} from 'osucad-framework';
import { HitObjectList } from '../../../../beatmap/hitObjects/HitObjectList.ts';
import { Slider } from '../../../../beatmap/hitObjects/Slider.ts';
import { Spinner } from '../../../../beatmap/hitObjects/Spinner.ts';
import { OsucadConfigManager } from '../../../../config/OsucadConfigManager.ts';
import { OsucadSettings } from '../../../../config/OsucadSettings.ts';
import { animate } from '../../../../utils/animate.ts';
import { EditorClock } from '../../../EditorClock.ts';
import { GameplayCursor } from './GameplayCursor.ts';

export class GameplayVisualizer extends VisibilityContainer {
  isVisible = new BindableBoolean(true);

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  @dependencyLoader()
  load() {
    this.config.bindWith(OsucadSettings.ShowGameplayCursor, this.isVisible);

    this.relativeSizeAxes = Axes.Both;

    this.addInternal(this.cursor = new GameplayCursor());

    this.isVisible.addOnChangeListener(evt => evt.value ? this.show() : this.hide(), { immediate: true });
  }

  override popIn() {
    this.alpha = 1;
    this.#firstUpdateSinceShow = true;
  }

  override popOut() {
    this.alpha = 0;
  }

  protected cursor!: GameplayCursor;

  @resolved(HitObjectList)
  protected hitObjects!: HitObjectList;

  #currentHitObjectIndex = 0;

  #firstUpdateSinceShow = true;

  update() {
    super.update();

    if (this.hitObjects.length === 0) {
      this.cursor.alpha = 0;
      return;
    }

    this.cursor.alpha = 1;

    const hitObject = this.#updateHitObjectIndex();

    const time = this.editorClock.currentTime;

    if (hitObject) {
      let position: Vec2;

      if (
        (time >= hitObject.startTime && time < this.#getEndTime(hitObject))
        || (this.#currentHitObjectIndex === 0 && time < hitObject.startTime)
      ) {
        position = this.#getHitObjectPositionAt(hitObject, time);
      }
      else {
        const next = this.hitObjects.get(this.#currentHitObjectIndex + 1);
        if (!next)
          return;

        const duration = next.startTime - hitObject.endTime;

        const startPosition = hitObject.stackedEndPosition;
        const endPosition = next.stackedPosition;

        const distance = startPosition.distance(endPosition);

        const cursorDance = duration > 350 && distance < 200;

        const progress = clamp((time - this.#getEndTime(hitObject)) / duration, 0, 1);

        position = startPosition.lerp(endPosition, progress);

        if (cursorDance) {
          const factor
            = progress < 0.55
              ? animate(progress, 0, 0.55, 0, 1, EasingFunction.OutCubic)
              : animate(progress, 0.55, 1, 1, 0, EasingFunction.InCubic);

          let direction = distance === 0
            ? new Vec2(0, -1)
            : endPosition.sub(startPosition).normalize().rotate(Math.PI / 2);

          if (direction.y > 0)
            direction.scaleInPlace(-1);

          direction = direction.lerp(new Vec2(0, -1), 0.5);

          position.addInPlace(direction.scale(factor * Math.max(distance * 0.5, 60)));
        }
      }

      if (this.#firstUpdateSinceShow) {
        this.cursor.position = position;
        this.#firstUpdateSinceShow = false;
      }
      else {
        this.cursor.position = position.lerp(this.cursor.position, Math.exp(-0.05 * this.time.elapsed));
      }
    }
  }

  #getEndTime(hitObject: OsuHitObject) {
    if (hitObject instanceof Slider) {
      // slider leniency
      return Math.max(
        hitObject.endTime - 36,
        hitObject.startTime + hitObject.duration * 0.5,
      );
    }

    return hitObject.endTime;
  }

  #getHitObjectPositionAt(hitObject: OsuHitObject, time: number) {
    if (hitObject instanceof Slider)
      return hitObject.getPositionAtTime(time);

    if (hitObject instanceof Spinner) {
      const center = new Vec2(512 / 2, 384 / 2);
      const spinRadius = 50;

      const timeSinceStart = time - hitObject.startTime;

      const angle = Math.PI * 2 * timeSinceStart * 0.005;

      return center.add(new Vec2(spinRadius * Math.cos(angle), spinRadius * Math.sin(angle)));
    }

    return hitObject.stackedPosition;
  }

  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  #updateHitObjectIndex(): OsuHitObject | null {
    let index = clamp(this.#currentHitObjectIndex, 0, this.hitObjects.length - 1);

    while (index > 0 && this.editorClock.currentTime < this.hitObjects.get(index)!.startTime)
      index--;

    while (index < this.hitObjects.length - 1 && this.editorClock.currentTime > this.hitObjects.get(index + 1)!.startTime)
      index++;

    this.#currentHitObjectIndex = index;

    return this.hitObjects.get(this.#currentHitObjectIndex) ?? null;
  }
}