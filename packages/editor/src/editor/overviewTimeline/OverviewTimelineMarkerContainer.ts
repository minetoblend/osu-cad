import { Beatmap } from '@osucad/common';
import type {
  ColorSource,
  Drawable,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  CompositeDrawable,
  Invalidation,
  LayoutMember,
  RoundedBox,
  resolved,
} from 'osucad-framework';

export abstract class OverviewTimelineMarkerContainer extends CompositeDrawable {
  constructor(options: { height: number; verticalPadding?: number }) {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = options.height;
    this.anchor = Anchor.TopLeft;
    this.origin = Anchor.TopLeft;
    this.padding = { vertical: options.verticalPadding ?? 0 };
  }

  abstract createMarkers(): Drawable[];

  #markersValid = new LayoutMember(Invalidation.None);

  @resolved(Beatmap)
  protected readonly beatmap!: Beatmap;

  protected invalidateMarkers() {
    this.#markersValid.invalidate();
  }

  update(): void {
    super.update();

    if (!this.#markersValid.isValid) {
      this.#updateTicks();

      this.#markersValid.validate();
    }
  }

  #updateTicks() {
    while (this.internalChildren.length) {
      this.removeInternal(this.internalChildren[0]);
    }

    this.addAllInternal(...this.createMarkers());
  }
}

export class OverviewTimelineMarker extends CompositeDrawable {
  constructor(color: ColorSource, width: number = 3) {
    super();

    this.relativeSizeAxes = Axes.Y;
    this.width = width;
    this.relativePositionAxes = Axes.X;

    this.addInternal(
      (this.#tick = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        origin: Anchor.TopCenter,
        cornerRadius: width * 0.5,
        color,
      })),
    );
  }

  #tick: RoundedBox;
}
