import type { OsuHitObject } from '@osucad/common';
import { HitObjectList, OsucadConfigManager, OsucadSettings, Slider, Spinner } from '@osucad/common';
import { Axes, BindableBoolean, clamp, dependencyLoader, EasingFunction, resolved, Vec2, VisibilityContainer } from 'osucad-framework';
import { animate } from '../../../../utils/animate';
import { EditorClock } from '../../../EditorClock';
import { GameplayCursor } from './GameplayCursor';

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

    this.hitObjectList.added.addListener(this.#invalidateHitObjects, this);
    this.hitObjectList.removed.addListener(this.#invalidateHitObjects, this);
    this.hitObjectList.sorted.addListener(this.#invalidateHitObjects, this);
  }

  #invalidateHitObjects() {
    this.#hitObjects = undefined;
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
  protected hitObjectList!: HitObjectList;

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

    let fac = 0.05;

    if (hitObject) {
      let position: Vec2;

      if (
        (time >= hitObject.startTime && time < this.#getEndTime(hitObject))
        || (this.#currentHitObjectIndex === 0 && time < hitObject.startTime)
      ) {
        position = this.#getHitObjectPositionAt(hitObject, time);
      }
      else {
        const next = this.hitObjects[this.#currentHitObjectIndex + 1];
        if (!next)
          return;

        const duration = next.startTime - hitObject.endTime;

        const startPosition = this.#getEndPosition(hitObject);
        const endPosition = next.stackedPosition;

        const distance = startPosition.distance(endPosition);

        fac = distance / duration * 0.025 + 0.01;

        const delta = endPosition.sub(startPosition);

        const isMostlyHorizontal = delta.y === 0 || Math.abs(delta.x / delta.y) > 1.5;

        const cursorDance = duration > 350 && distance < 200;
        const curvedPath = isMostlyHorizontal && distance >= 100 && duration > 100;

        const progress = clamp((time - this.#getEndTime(hitObject)) / duration, 0, 1);

        if (progress > 0.9)
          fac += 0.025;

        position = startPosition.lerp(endPosition, progress);

        if (cursorDance || curvedPath) {
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

          const amount = cursorDance ? Math.max(distance * 0.5, 60) : Math.min(distance * 0.065, 30);

          position.addInPlace(direction.scale(factor * amount));
        }
      }

      if (!Number.isFinite(position.x) || !Number.isFinite(position.y))
        return;

      if (this.#firstUpdateSinceShow || !this.editorClock.isRunning) {
        this.cursor.position = position;
        this.#firstUpdateSinceShow = false;
      }
      else {
        this.cursor.position = position.lerp(this.cursor.position, Math.exp(-fac * this.time.elapsed));
      }
    }
  }

  #getEndTime(hitObject: OsuHitObject) {
    if (hitObject instanceof Slider) {
      // slider leniency
      return Math.max(
        hitObject.endTime - 50,
        hitObject.startTime + hitObject.duration * 0.5,
      );
    }

    return hitObject.endTime;
  }

  #getEndPosition(hitObject: OsuHitObject) {
    if (hitObject instanceof Slider) {
      // slider leniency
      return hitObject.getPositionAtTime(this.#getEndTime(hitObject));
    }

    return hitObject.endPosition;
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

  #hitObjects?: OsuHitObject[];

  get hitObjects() {
    this.#hitObjects ??= this.hitObjectList.items.filter(it => !it.synthetic);

    return this.#hitObjects;
  }

  #updateHitObjectIndex(): OsuHitObject | null {
    let index = clamp(this.#currentHitObjectIndex, 0, this.hitObjects.length - 1);

    while (index > 0 && this.editorClock.currentTime < this.hitObjects[index].startTime)
      index--;

    while (index < this.hitObjects.length - 1 && this.editorClock.currentTime > this.hitObjects[index + 1].startTime)
      index++;

    this.#currentHitObjectIndex = index;

    return this.hitObjects[this.#currentHitObjectIndex] ?? null;
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.hitObjectList.added.removeListener(this.#invalidateHitObjects, this);
    this.hitObjectList.removed.removeListener(this.#invalidateHitObjects, this);
    this.hitObjectList.sorted.removeListener(this.#invalidateHitObjects, this);
  }
}
