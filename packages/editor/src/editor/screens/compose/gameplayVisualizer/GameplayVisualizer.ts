import type { OsuHitObject } from '../../../../beatmap/hitObjects/OsuHitObject.ts';
import { Axes, BindableBoolean, clamp, dependencyLoader, resolved, Vec2, VisibilityContainer } from 'osucad-framework';
import { HitObjectList } from '../../../../beatmap/hitObjects/HitObjectList.ts';
import { Slider } from '../../../../beatmap/hitObjects/Slider.ts';
import { Spinner } from '../../../../beatmap/hitObjects/Spinner.ts';
import { OsucadConfigManager } from '../../../../config/OsucadConfigManager.ts';
import { OsucadSettings } from '../../../../config/OsucadSettings.ts';
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

  override popIn() { this.alpha = 1; }

  override popOut() { this.alpha = 0; }

  protected cursor!: GameplayCursor;

  @resolved(HitObjectList)
  protected hitObjects!: HitObjectList;

  #currentHitObjectIndex = 0;

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
      if (time >= hitObject.startTime && time < hitObject.endTime) {
        this.cursor.position = this.#getHitObjectPositionAt(hitObject, time);
        return;
      }

      const next = this.hitObjects.get(this.#currentHitObjectIndex + 1);
      if (!next)
        return;

      const duration = Math.min(next.startTime - hitObject.endTime, 400);
      const progress = clamp((time - hitObject.endTime) / duration, 0, 1);

      this.cursor.position = hitObject.stackedEndPosition.lerp(next.stackedPosition, progress);
    }
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

    while (index > 0 && this.editorClock.currentTime < this.hitObjects.get(index - 1)!.endTime)
      index--;

    while (index < this.hitObjects.length - 1 && this.editorClock.currentTime > this.hitObjects.get(index + 1)!.startTime)
      index++;

    this.#currentHitObjectIndex = index;

    return this.hitObjects.get(this.#currentHitObjectIndex) ?? null;
  }
}
