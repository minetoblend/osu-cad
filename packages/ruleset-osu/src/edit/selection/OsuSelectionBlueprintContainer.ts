import type { HitObject, HitObjectLifetimeEntry, HitObjectSelectionEvent } from '@osucad/core';
import type { MouseDownEvent, ReadonlyDependencyContainer, Vec2 } from '@osucad/framework';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import type { OsuSelectionBlueprint } from './OsuSelectionBlueprint';
import { EditorBeatmap, EditorClock, HitObjectBlueprintContainer, HitObjectSelectionManager } from '@osucad/core';
import { MouseButton, resolved } from '@osucad/framework';
import { HitCircle } from '../../hitObjects/HitCircle';
import { Slider } from '../../hitObjects/Slider';
import { Spinner } from '../../hitObjects/Spinner';
import { OsuHitObjectLifetimeEntry } from '../../ui/OsuPlayfield';
import { HitCircleSelectionBlueprint } from './HitCircleSelectionBlueprint';
import { OsuSelectBox } from './OsuSelectBox';
import { SliderSelectionBlueprint } from './SliderSelectionBlueprint';
import { SpinnerSelectionBlueprint } from './SpinnerSelectionBlueprint';

export class OsuSelectionBlueprintContainer extends HitObjectBlueprintContainer<OsuSelectionBlueprint> {
  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(HitObjectSelectionManager)
  selection!: HitObjectSelectionManager;

  readonly = false;

  override getPooledDrawableRepresentation(hitObject: HitObject): OsuSelectionBlueprint | undefined {
    const drawable = super.getPooledDrawableRepresentation(hitObject);

    if (drawable)
      drawable.readonly = this.readonly;

    return drawable;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.clock = this.editorClock;
    this.processCustomClock = false;

    this.registerPool(HitCircle, HitCircleSelectionBlueprint, 20, 40);
    this.registerPool(Slider, SliderSelectionBlueprint, 20, 40);
    this.registerPool(Spinner, SpinnerSelectionBlueprint, 2, 10);

    this.addInternal(new OsuSelectBox());
  }

  @resolved(EditorBeatmap)
  beatmap!: EditorBeatmap;

  protected override loadComplete() {
    super.loadComplete();

    for (const h of this.beatmap.hitObjects)
      this.addHitObject(h);

    this.beatmap.hitObjects.added.addListener(this.addHitObject, this);
    this.beatmap.hitObjects.removed.addListener(this.removeHitObject, this);

    this.selection.selectionChanged.addListener(this.#selectionChanged, this);
  }

  #selectionChanged(evt: HitObjectSelectionEvent) {
    const entry = this.getEntry(evt.hitObject);
    if (!entry)
      return;

    entry.keepAlive = evt.selected;
  }

  protected override createLifeTimeEntry(hitObject: HitObject): HitObjectLifetimeEntry {
    return new OsuHitObjectLifetimeEntry(hitObject as OsuHitObject);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.beatmap.hitObjects.added.removeListener(this.addHitObject, this);
    this.beatmap.hitObjects.removed.removeListener(this.removeHitObject, this);
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return true;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.selection.clear();
    }

    return true;
  }
}
