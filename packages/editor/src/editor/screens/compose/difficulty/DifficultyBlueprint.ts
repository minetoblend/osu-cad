import type { Vec2 } from 'osucad-framework';
import type { Slider } from '../../../../beatmap/hitObjects/Slider';
import type { OsuDifficultyHitObject } from '../../../../difficulty/preprocessing/OsuDifficultyHitObject';
import { Bindable, Container, dependencyLoader, resolved } from 'osucad-framework';
import { HitObjectList } from '../../../../beatmap/hitObjects/HitObjectList';
import { Spinner } from '../../../../beatmap/hitObjects/Spinner';
import { DrawableOsuHitObject } from '../../../hitobjects/DrawableOsuHitObject';
import { DifficultyObjectDetails } from './DifficultyObjectDetails';
import { DifficultyObjectList } from './DynamicOsuDifficultyObject';
import { MovementPathSegment } from './MovementPathSegment';

export class DifficultyBlueprint extends DrawableOsuHitObject {
  constructor() {
    super();
  }

  #difficultyHitObject: OsuDifficultyHitObject | null = null;

  #content!: Container;

  #details!: DifficultyObjectDetails;

  detailsVisible = new Bindable(false);

  @dependencyLoader()
  load() {
    this.addAllInternal(
      this.#content = new Container(),
      this.#details = new DifficultyObjectDetails(this),
    );

    this.detailsVisible.addOnChangeListener(e => e.value ? this.#details.show() : this.#details.hide(), { immediate: true });
  }

  @resolved(DifficultyObjectList)
  difficultyObjects!: DifficultyObjectList;

  @resolved(HitObjectList)
  hitObjects!: HitObjectList;

  readonly difficultyObject = new Bindable<OsuDifficultyHitObject | null>(null);

  onApplied() {
    super.onApplied();

    this.difficultyObjects.invalidated.addListener(this.#invalidated, this);

    this.detailsVisible.value = true;

    this.createContent();
  }

  onFreed() {
    super.onFreed();

    this.difficultyObject.value = null;

    this.detailsVisible.value = false;

    this.difficultyObjects.invalidated.removeListener(this.#invalidated, this);
  }

  #invalidated() {
    this.scheduler.addOnce(this.createContent, this);
  }

  createContent() {
    this.#content.clear();

    const hitObject = this.difficultyObjects.fromHitObject(this.hitObject!);

    this.difficultyObject.value = hitObject;

    if (!hitObject)
      return;

    const positions: { position: Vec2; time: number }[] = [];

    if (hitObject.lazyTravelPath && hitObject.lazyTravelPath.length > 0) {
      positions.push(...hitObject.lazyTravelPath);
    }
    else {
      positions.push({
        position: hitObject.baseObject.stackedPosition.clone(),
        time: hitObject.baseObject.startTime,
      });
    }

    const next = this.hitObjects.get(hitObject.index + 1);

    if (next && !(next instanceof Spinner)) {
      if (hitObject.lazyTravelPath && hitObject.lazyTravelPath.length > 0) {
        const endPosition = hitObject.lazyTravelPath[hitObject.lazyTravelPath.length - 1].position;

        const tailPosition = (hitObject.baseObject as Slider).tailCircle!.stackedPosition;

        if (tailPosition.distanceSq(next.stackedPosition) < endPosition.distanceSq(next.stackedPosition)) {
          positions[positions.length - 1] = {
            position: tailPosition.clone(),
            time: hitObject.endTime,
          };
        }
        else {
          positions[positions.length - 1] = {
            ...positions[positions.length - 1],
            time: hitObject.endTime - 36,
          };
        }
      }

      positions.push({
        position: next.stackedPosition.clone(),
        time: next.startTime,
      });
    }

    this.#content.clear();

    for (let i = 0; i < positions.length - 1; i++) {
      this.#content.add(new MovementPathSegment(
        positions[i].position,
        positions[i + 1].position,
        positions[i].time,
        positions[i + 1].time,
      ));
    }
  }

  protected updateInitialTransforms() {
    super.updateInitialTransforms();

    this.fadeIn();
  }

  protected updateHitStateTransforms() {
    super.updateHitStateTransforms();

    this.delay(1000).fadeOut();
  }
}
