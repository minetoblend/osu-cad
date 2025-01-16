import type { HitObjectContainer, ISkinSource } from '@osucad/core';
import type { DrawableOptions, ReadonlyDependencyContainer } from '@osucad/framework';
import { IScrollingInfo, ScrollingDirection, SkinReloadableDrawable } from '@osucad/core';
import { Axes, Bindable, Container } from '@osucad/framework';
import { LegacyManiaSkinConfigurationLookups } from '../skinning/LegacyManiaSkinConfigurationLookups';
import { ManiaSkinConfigurationLookup } from '../skinning/ManiaSkinConfigurationLookup';
import { Stage } from './Stage';

export class HitObjectArea extends SkinReloadableDrawable {
  protected readonly direction = new Bindable<ScrollingDirection>(ScrollingDirection.Default);

  constructor(readonly hitObjectContainer: HitObjectContainer, options: DrawableOptions = {}) {
    super();
    this.internalChild = new Container({
      relativeSizeAxes: Axes.Both,
      child: hitObjectContainer,
    });

    this.with(options);
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const scrollingInfo = dependencies.resolve(IScrollingInfo);
    this.direction.bindTo(scrollingInfo.direction);
    this.direction.addOnChangeListener(() => this.#onDirectionChanged(), { immediate: true });
  }

  protected override skinChanged(skin: ISkinSource) {
    super.skinChanged(skin);
    this.updateHitPosition();
  }

  #onDirectionChanged() {
    this.updateHitPosition();
  }

  protected updateHitPosition() {
    const hitPosition = this.currentSkin?.getConfig(
      new ManiaSkinConfigurationLookup<number>(LegacyManiaSkinConfigurationLookups.HitPosition),
    )
    ?? Stage.HIT_TARGET_POSITION;

    this.padding = this.direction.value === ScrollingDirection.Up
      ? { top: hitPosition }
      : { bottom: hitPosition };
  }
}
