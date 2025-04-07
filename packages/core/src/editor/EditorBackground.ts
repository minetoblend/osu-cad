import type { ReadonlyDependencyContainer, ScreenExitEvent } from '@osucad/framework';
import type { Texture } from 'pixi.js';
import type { EditorBeatmap } from './EditorBeatmap';
import { Anchor, Axes, Bindable, DrawableSprite, FillMode, resolved } from '@osucad/framework';
import { OsucadConfigManager } from '../config/OsucadConfigManager';
import { OsucadSettings } from '../config/OsucadSettings';
import { BackgroundScreen } from '../screens/BackgroundScreen';

export class EditorBackground extends BackgroundScreen {
  constructor(
    readonly editorBeatmap: EditorBeatmap,
  ) {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.relativePositionAxes = Axes.Both;
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
  }

  texture!: Bindable<Texture | null>;

  #currentBackground?: DrawableSprite;

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  backgroundDim = new Bindable(0);

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.config.bindWith(OsucadSettings.BackgroundDim, this.backgroundDim);
  }

  protected override loadComplete() {
    super.loadComplete();

    const filename = this.editorBeatmap.metadata.backgroundFile?.trim();
    if (!filename)
      return;

    this.texture = this.editorBeatmap.backgroundTexture.getBoundCopy();

    this.backgroundDim.bindValueChanged((dim) => {
      this.#currentBackground?.finishTransforms(true);
      this.#currentBackground?.fadeTo(1 - dim.value, 200);
    });

    this.texture.bindValueChanged((texture) => {
      this.#currentBackground?.fadeOut(500).expire();

      if (!texture)
        return;

      const sprite = this.#currentBackground = new DrawableSprite({
        texture: texture.value,
        relativeSizeAxes: Axes.Both,
        fillMode: FillMode.Fill,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      });

      this.addInternal(sprite);
      sprite.fadeTo(0).fadeTo(1 - this.backgroundDim.value, 500);
    }, true);
  }

  override onExiting(e: ScreenExitEvent): boolean {
    this.fadeOut(100);

    return false;
  }
}
