import type { MouseDownEvent, ReadonlyDependencyContainer, Vec2 } from 'osucad-framework';
import type { HitObjectSelectionEvent } from '../../../../editor/screens/compose/HitObjectSelectionManager';
import type { HitObjectLifetimeEntry } from '../../../../hitObjects/drawables/HitObjectLifetimeEntry';
import type { HitObject } from '../../../../hitObjects/HitObject';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import type { OsuSelectionBlueprint } from './OsuSelectionBlueprint';
import { MouseButton, resolved } from 'osucad-framework';
import { HitObjectList } from '../../../../beatmap/HitObjectList';
import { EditorClock } from '../../../../editor/EditorClock';
import { HitObjectSelectionManager } from '../../../../editor/screens/compose/HitObjectSelectionManager';
import { HitObjectBlueprintContainer } from '../../../ui/HitObjectBlueprintContainer';
import { HitCircle } from '../../hitObjects/HitCircle';
import { Slider } from '../../hitObjects/Slider';
import { OsuHitObjectLifetimeEntry } from '../../ui/OsuPlayfield';
import { HitCircleSelectionBlueprint } from './HitCircleSelectionBlueprint';
import { OsuSelectBox } from './OsuSelectBox';
import { SliderSelectionBlueprint } from './SliderSelectionBlueprint';

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

    this.addInternal(new OsuSelectBox());
  }

  @resolved(HitObjectList)
  hitObjects!: HitObjectList;

  protected override loadComplete() {
    super.loadComplete();

    for (const h of this.hitObjects)
      this.addHitObject(h);

    this.hitObjects.added.addListener(this.addHitObject, this);
    this.hitObjects.removed.addListener(this.removeHitObject, this);

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

    this.hitObjects.added.removeListener(this.addHitObject, this);
    this.hitObjects.removed.removeListener(this.removeHitObject, this);
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
