import type { DependencyContainer } from 'osucad-framework';
import type { HitObject } from '../../../../beatmap/hitObjects/HitObject';
import { Axes, BindableBoolean, CompositeDrawable, dependencyLoader, resolved } from 'osucad-framework';
import { OsuHitObject } from '../../../../beatmap/hitObjects/OsuHitObject';
import { CommandManager } from '../../../context/CommandManager';
import { EditorClock } from '../../../EditorClock';
import { EditorDependencies } from '../../../EditorDependencies';
import { HitObjectLifetimeEntry } from '../../../hitobjects/HitObjectLifetimeEntry';
import { Playfield } from '../../../hitobjects/Playfield';
import { DifficultyBlueprint } from './DifficultyBlueprint';
import { DifficultyObjectList } from './DynamicOsuDifficultyObject';

export class OsuDifficultyOverlay extends CompositeDrawable {
  isVisible = new BindableBoolean(false);

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    this.relativeSizeAxes = Axes.Both;

    this.addInternal(new OsuDifficultyPlayfield());

    this.isVisible.bindTo(dependencies.resolve(EditorDependencies).showDifficultyOverlay);

    // this.isVisible.addOnChangeListener(e => e.value ? this.show() : this.hide(), { immediate: true });
  }

  override loadComplete() {
    super.loadComplete();
  }
}

export class OsuDifficultyPlayfield extends Playfield {
  @resolved(EditorClock)
  playfieldClock!: EditorClock;

  @resolved(CommandManager)
  commandManager!: CommandManager;

  difficultyObjects!: DifficultyObjectList;

  @dependencyLoader()
  load() {
    this.clock = this.playfieldClock;
    this.processCustomClock = false;

    this.difficultyObjects = new DifficultyObjectList(this.beatmap.hitObjects);

    this.dependencies.provide(DifficultyObjectList, this.difficultyObjects);

    this.commandManager.commandApplied.addListener(this.#commandApplied, this);

    // @ts-expect-error abstract class
    this.registerPool(OsuHitObject, DifficultyBlueprint, 10, 20);
  }

  #commandApplied() {
    this.scheduler.addOnce(this.#invalidateDifficultyObjects, this);
  }

  #invalidateDifficultyObjects() {
    this.difficultyObjects.invalidate();
  }

  protected createLifeTimeEntry(hitObject: HitObject): HitObjectLifetimeEntry {
    return new OsuHitObjectLifetimeEntry(hitObject as OsuHitObject);
  }

  override dispose(isDisposing: boolean = true) {
    this.commandManager.commandApplied.removeListener(this.#invalidateDifficultyObjects, this);

    super.dispose(isDisposing);
  }
}

class OsuHitObjectLifetimeEntry extends HitObjectLifetimeEntry {
  constructor(hitObject: OsuHitObject) {
    super(hitObject);

    this.lifetimeEnd = hitObject.endTime + 700;

    hitObject.defaultsApplied.addListener((e) => {
      if (this.lifetimeEnd < hitObject.endTime + 700)
        this.lifetimeEnd = hitObject.endTime + 700;
    });
  }

  get initialLifetimeOffset() {
    return Math.max(this.hitObject.timePreempt, 700);
  }
}
