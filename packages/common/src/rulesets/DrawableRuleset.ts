import type { IBeatmap } from '../beatmap/IBeatmap';
import type { DrawableHitObject } from '../hitObjects/drawables/DrawableHitObject';
import type { HitObject } from '../hitObjects/HitObject';
import type { HitWindows } from '../hitObjects/HitWindows';
import type { JudgementResult } from '../hitObjects/JudgementResult';
import type { Ruleset } from './Ruleset';
import type { Playfield } from './ui/Playfield';
import {
  Action,
  Axes,
  CompositeDrawable,
  Container,
  dependencyLoader,
  Lazy,
  type PassThroughInputManager,
} from 'osucad-framework';
import { HitResult } from '../hitObjects/HitResult';
import { PlayfieldAdjustmentContainer } from './ui/PlayfieldAdjustmentContainer';

export abstract class DrawableRuleset<TObject extends HitObject = HitObject> extends CompositeDrawable {
  readonly newResult = new Action<JudgementResult>();

  readonly #playfield: Lazy<Playfield>;

  get playfield(): Playfield {
    return this.#playfield.value;
  }

  readonly overlays: Container = new Container({
    relativeSizeAxes: Axes.Both,
  });

  #playfieldAdjustmentContainer!: PlayfieldAdjustmentContainer;

  get playfieldAdjustmentContainer(): PlayfieldAdjustmentContainer {
    return this.#playfieldAdjustmentContainer;
  }

  public readonly beatmap: IBeatmap;

  get hitObjects(): ReadonlyArray<HitObject> {
    return this.beatmap.hitObjects.items;
  }

  protected keyBindingInputManager: PassThroughInputManager;

  protected constructor(readonly ruleset: Ruleset, beatmap: IBeatmap) {
    super();
    this.beatmap = beatmap;
    this.relativeSizeAxes = Axes.Both;
    this.keyBindingInputManager = this.createInputManager();

    this.#playfield = new Lazy<Playfield>(() => this.createPlayfield().adjust((p) => {
      p.newResult.addListener(([_, r]) => this.newResult.emit(r));
    }));
  }

  protected override loadComplete() {
    super.loadComplete();

    this.playfieldAdjustmentContainer.add(this.playfield);

    this.#loadObjects();
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.internalChildren = [
      this.#playfieldAdjustmentContainer = this.createPlayfieldAdjustmentContainer(),
      this.overlays,
    ];
  }

  #loadObjects() {
    for (const hitObject of this.beatmap.hitObjects)
      this.addHitObject(hitObject as unknown as TObject);

    this.beatmap.hitObjects.added.addListener(this.addHitObject as any, this);
    this.beatmap.hitObjects.removed.addListener(this.removeHitObject as any, this);
  }

  addHitObject(hitObject: TObject) {
    const drawableRepresentation = this.createDrawableRepresentation(hitObject);

    if (drawableRepresentation !== null)
      this.playfield.add(drawableRepresentation);
    else
      this.playfield.addHitObject(hitObject);
  }

  removeHitObject(hitObject: TObject) {
    if (this.playfield.removeHitObject(hitObject))
      return true;

    const drawableObject = this.playfield.allHitObjects.find(d => d.hitObject === hitObject);
    if (drawableObject)
      return this.playfield.remove(drawableObject);

    return false;
  }

  abstract createDrawableRepresentation(hitObject: TObject): DrawableHitObject | null;

  createPlayfieldAdjustmentContainer(): PlayfieldAdjustmentContainer {
    return new PlayfieldAdjustmentContainer();
  }

  abstract createInputManager(): PassThroughInputManager;

  abstract createPlayfield(): Playfield;

  get gameplayStartTime(): number {
    if (this.hitObjects[0])
      return this.hitObjects[0].startTime - 2000;
    return 0;
  }

  firstAvailableHitWindows(): HitWindows | null {
    for (const hitObject of this.hitObjects) {
      if (hitObject.hitWindows.windowFor(HitResult.Miss) > 0)
        return hitObject.hitWindows;

      for (const nested of hitObject.nestedHitObjects) {
        if (nested.hitWindows.windowFor(HitResult.Miss) > 0)
          return nested.hitWindows;
      }
    }

    return null;
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.beatmap.hitObjects.added.removeListener(this.addHitObject as any, this);
    this.beatmap.hitObjects.removed.removeListener(this.removeHitObject as any, this);
  }

  // public override double GameplayStartTime => Objects.FirstOrDefault()?.StartTime - 2000 ?? 0;
}
