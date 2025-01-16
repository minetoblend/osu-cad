import type { ClickEvent, RoundedBox } from '@osucad/framework';
import type { ColorSource } from 'pixi.js';
import type { VolumePointSelectionBlueprint } from './VolumePointSelectionBlueprint';
import { Anchor, Axes, ColorUtils, Container, dependencyLoader, resolved } from '@osucad/framework';
import { UpdateHandler } from '@osucad/multiplayer';
import { VolumeCurveType } from '../../../../controlPoints/VolumePoint';
import { OsucadSpriteText } from '../../../../drawables/OsucadSpriteText';
import { TimingScreenBadge } from '../TimingScreenBadge';

export class CurveTypeButton extends TimingScreenBadge {
  constructor(
    readonly blueprint: VolumePointSelectionBlueprint,
  ) {
    super();
    this.backgroundColor = this.blueprint.keyframeColor.value;
  }

  override readonly backgroundColor: ColorSource;

  @dependencyLoader()
  [Symbol('load')]() {
    this.addAllInternal(
      new Container({
        autoSizeAxes: Axes.Both,
        padding: { horizontal: 4, vertical: 2 },
        child: this.#text = new OsucadSpriteText({
          text: 'Smooth',
          fontSize: 12,
          anchor: Anchor.Center,
          origin: Anchor.Center,
          color: this.backgroundColor,
        }),
      }),
    );

    this.blueprint.curveTypeBindable.addOnChangeListener(
      e => this.#text.text = e.value === VolumeCurveType.Smooth ? 'Smooth' : 'Constant',
      { immediate: true },
    );
  }

  protected override createBackground(): RoundedBox {
    return super.createBackground().adjust(it => it.fillColor = ColorUtils.darken(this.backgroundColor, 0.25));
  }

  #text!: OsucadSpriteText;

  @resolved(UpdateHandler)
  protected updateHandler!: UpdateHandler;

  override onClick(e: ClickEvent): boolean {
    const curveType = this.blueprint.curveTypeBindable.value;

    this.blueprint.curveTypeBindable.value = curveType === VolumeCurveType.Smooth
      ? VolumeCurveType.Constant
      : VolumeCurveType.Smooth;

    this.updateHandler.commit();

    return true;
  }
}
