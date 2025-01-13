import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { DrawableHitObjectPlacementTool, HitSound, SampleSet, TernaryState } from '@osucad/common';
import { clamp, resolved, Vec2 } from 'osucad-framework';
import { GlobalHitSoundState } from './GlobalHitSoundState';
import { GlobalNewComboBindable } from './GlobalNewComboBindable';
import { IDistanceSnapProvider } from './IDistanceSnapProvider';
import { IPositionSnapProvider } from './IPositionSnapProvider';

export abstract class DrawableOsuHitObjectPlacementTool<T extends OsuHitObject> extends DrawableHitObjectPlacementTool<T> {
  @resolved(IPositionSnapProvider)
  protected snapProvider!: IPositionSnapProvider;

  @resolved(GlobalNewComboBindable)
  protected newCombo!: GlobalNewComboBindable;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    if (this.newCombo.value === TernaryState.Indeterminate)
      this.newCombo.value = TernaryState.Inactive;

    this.newCombo.bindValueChanged(newCombo => this.hitObject.newCombo = newCombo.value === TernaryState.Active);
  }

  @resolved(GlobalHitSoundState)
  protected hitSounds!: GlobalHitSoundState;

  protected override applyDefaults(hitObject: T) {
    super.applyDefaults(hitObject);

    hitObject.position = this.snappedMousePosition;
    hitObject.newCombo = this.newCombo.value === TernaryState.Active;
    hitObject.hitSound = new HitSound(
      this.hitSounds.sampleSet.value ?? SampleSet.Auto,
      this.hitSounds.additionsSampleSet.value ?? SampleSet.Auto,
      this.hitSounds.additions,
    );
  }

  clampToBounds(position: Vec2) {
    return new Vec2(
      clamp(position.x, 0, 512),
      clamp(position.y, 0, 384),
    );
  }

  get snappedMousePosition() {
    return this.snapPosition(this.playfieldMousePosition);
  }

  protected snapPosition(position: Vec2, clampToBounds: boolean = true) {
    const snapResult = this.snapProvider.snapPosition(position);

    if (snapResult)
      position = snapResult.position;

    if (clampToBounds)
      position = this.clampToBounds(position);

    return position;
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return this.receiveInputEverywhere || super.receivePositionalInputAt(screenSpacePosition);
  }

  protected get receiveInputEverywhere() {
    return true;
  }

  @resolved(IDistanceSnapProvider)
  distanceSnapProvider!: IDistanceSnapProvider;

  protected override endPlacement() {
    super.endPlacement();

    this.newCombo.value = TernaryState.Inactive;
  }
}
