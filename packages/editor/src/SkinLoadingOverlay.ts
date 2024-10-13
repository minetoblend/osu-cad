import type {
  Bindable,
} from 'osucad-framework';
import type { LoadableSkin } from './environment';
import {
  Anchor,
  Axes,
  Box,
  CompositeDrawable,
  Container,
  dependencyLoader,
  EasingFunction,
  MaskingContainer,
  resolved,
} from 'osucad-framework';
import { LoadingSpinner } from './drawables/LoadingSpinner';
import { OsucadSpriteText } from './OsucadSpriteText';
import { SkinManager } from './skinning/SkinManager';

export class SkinLoadingOverlay extends CompositeDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(SkinManager)
  skinManager!: SkinManager;

  loadingSkin!: Bindable<LoadableSkin | null>;

  @dependencyLoader()
  load() {
    this.loadingSkin = this.skinManager.loadingSkin.getBoundCopy();

    this.loadingSkin.valueChanged.addListener((evt) => {
      if (this.#skinLoadingOverlay) {
        this.#skinLoadingOverlay.hide();
        this.#skinLoadingOverlay.expire();
        this.#skinLoadingOverlay = null;
      }

      if (evt.value)
        this.addInternal(this.#skinLoadingOverlay = new SkinLoadingCard(evt.value));
    });
  }

  #skinLoadingOverlay: SkinLoadingCard | null = null;
}

class SkinLoadingCard extends MaskingContainer {
  constructor(readonly skin: LoadableSkin) {
    super();
  }

  @dependencyLoader()
  load() {
    this.autoSizeAxes = Axes.Y;
    this.width = 550;

    this.anchor = Anchor.BottomLeft;
    this.origin = Anchor.BottomLeft;

    this.x = 50;
    this.y = -50;

    this.cornerRadius = 6;

    this.addAllInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
        alpha: 0.9,
      }),
      new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        padding: 18,
        children: [
          new LoadingSpinner({
            width: 24,
            height: 24,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
          new OsucadSpriteText({
            x: 40,
            text: `Loading skin ${this.skin.name}...`,
            fontSize: 20,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
        ],
      }),
    );
  }

  protected loadComplete() {
    super.loadComplete();

    this
      .moveToX(-50)
      .moveToX(50, 350, EasingFunction.OutExpo)
      .fadeInFromZero(350, EasingFunction.OutQuad);
  }

  hide() {
    this
      .moveToX(-50, 350, EasingFunction.OutExpo)
      .fadeOut(350, EasingFunction.OutQuad);
  }
}
