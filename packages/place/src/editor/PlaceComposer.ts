import type { HitObjectSelectionManager, IComposeTool } from '@osucad/core';
import type { Bindable, ReadonlyDependencyContainer, Vec2 } from '@osucad/framework';
import { HitObjectComposer } from '@osucad/core';
import { EasingFunction, provide, resolved } from '@osucad/framework';
import { GlobalHitSoundState, GlobalNewComboBindable, IDistanceSnapProvider, IPositionSnapProvider, OsuSelectionManager, type SnapResult } from '@osucad/ruleset-osu';
import { PlaceClient } from './PlaceClient';
import { PlaceCircleTool } from './tools/PlaceCircleTool';
import { PlaceSelectTool } from './tools/PlaceSelectTool';

@provide(IPositionSnapProvider)
@provide(IDistanceSnapProvider)
export class PlaceComposer extends HitObjectComposer implements IPositionSnapProvider {
  @provide()
  readonly newCombo = new GlobalNewComboBindable();

  @provide()
  readonly hitSoundState = new GlobalHitSoundState();

  protected createSelectionManager(): HitObjectSelectionManager<any> {
    return new OsuSelectionManager();
  }

  @resolved(PlaceClient)
  client!: PlaceClient;

  protected getTools(): IComposeTool[] {
    return [
      new PlaceSelectTool(),
      new PlaceCircleTool(),
    ];
  }

  snapPosition(position: Vec2): SnapResult | null {
    return null;
  }

  canPlace!: Bindable<boolean>;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.canPlace = this.client.canPlace.getBoundCopy();
  }

  protected override loadComplete() {
    super.loadComplete();

    this.canPlace.bindValueChanged((evt) => {
      this.toolbar.moveToX(evt.value ? 0 : -100, 400, EasingFunction.OutElasticHalf);
    }, true);
  }
}
