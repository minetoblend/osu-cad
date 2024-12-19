import type { DragEvent } from 'osucad-framework';
import type { VolumePointSelectionBlueprint } from './VolumePointSelectionBlueprint';

import { Anchor, Axes, clamp, dependencyLoader } from 'osucad-framework';
import { DiamondKeyframePiece } from '../DiamondKeyframePiece';
import { CurveTypeButton } from './CurveTypeButton';

export class VolumePointKeyframePiece extends DiamondKeyframePiece {
  override blueprint!: VolumePointSelectionBlueprint;

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativePositionAxes = Axes.Y;
    this.width = this.height = 16;

    this.addInternal(
      this.#curveTypeButton = new CurveTypeButton(this.blueprint).with({
        anchor: Anchor.CenterLeft,
        scale: 0.75,
      }),
    );

    this.selected.addOnChangeListener((e) => {
      if (e.value)
        this.#curveTypeButton.show();
      else
        this.#curveTypeButton.hide();
    }, { immediate: true });

    this.blueprint.volumeBindable.addOnChangeListener(evt => this.#updatePosition(evt.value), { immediate: true });
  }

  #curveTypeButton!: CurveTypeButton;

  #updatePosition(volume: number) {
    this.y = 1 - volume / 100;

    if (volume > 75) {
      this.#curveTypeButton.origin = Anchor.TopLeft;
      this.#curveTypeButton.y = 5;
    }
    else {
      this.#curveTypeButton.origin = Anchor.BottomLeft;
      this.#curveTypeButton.y = -5;
    }
  }

  override onDrag(e: DragEvent): boolean {
    if (!super.onDrag(e))
      return false;

    this.blueprint.controlPoint!.volume = clamp(
      100 * (1 - this.parent!.toLocalSpace(e.screenSpaceMousePosition).y / this.parent!.drawHeight),
      5,
      100,
    );

    return true;
  }
}
