import type { Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { DrawableHoldNote } from '../../objects/drawables/DrawableHoldNote';
import type { IHoldNoteBody } from '../default/IHoldNoteBody';
import { DrawableHitObject } from '@osucad/common';
import { Axes, Bindable, Box, ColorUtils, MaskingContainer, resolved } from 'osucad-framework';
import { Color } from 'pixi.js';
import { ArgonHoldNoteHittingLayer } from './ArgonHoldNoteHittingLayer';
import { ArgonNotePiece } from './ArgonNotePiece';

export class ArgonHoldBodyPiece extends MaskingContainer implements IHoldNoteBody {
  private readonly accentColor = new Bindable(new Color(0xFFFFFF));

  #background!: Drawable;
  #hittingLayer!: ArgonHoldNoteHittingLayer;

  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.cornerRadius = ArgonNotePiece.CORNER_RADIUS;
  }

  @resolved(DrawableHitObject, true)
  drawableHitObject!: DrawableHitObject;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.internalChildren = [
      this.#background = new Box({ relativeSizeAxes: Axes.Both }),
      this.#hittingLayer = new ArgonHoldNoteHittingLayer(),
    ];

    if (this.drawableHitObject) {
      const holdNote = this.drawableHitObject as DrawableHoldNote;

      this.accentColor.bindTo(this.drawableHitObject.accentColor);
      this.#hittingLayer.accentColor.bindTo(this.accentColor);
      this.#hittingLayer.isHitting.bindTo(holdNote.isHitting);
    }

    this.accentColor.bindValueChanged((color) => {
      this.#background.color = ColorUtils.darkenSimple(color.value, 0.6);
    }, true);
  }

  recycle(): void {
    this.#hittingLayer.recycle();
  }
}
