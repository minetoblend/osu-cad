import { Container, resolved } from 'osucad-framework';
import { Easing } from 'osu-classes';
import { Color } from 'pixi.js';
import { PreferencesStore } from '../../preferences/PreferencesStore';
import { animate } from '../../utils/animate';
import { CirclePiece } from './CirclePiece';

export class AnimatedCirclePiece extends Container {
  constructor() {
    super();

    this.addInternal(this.#content);

    this.add(this.circlePiece = new CirclePiece());
  }

  timeFadeIn = 0;

  fadeInDuration = 0;

  timeFadeOut = 0;

  comboColor = new Color(0xFFFFFF);

  readonly circlePiece: CirclePiece;

  readonly #content = new Container();

  get content() {
    return this.#content;
  }

  @resolved(PreferencesStore)
  protected preferences!: PreferencesStore;

  update() {
    super.update();

    const time = this.time.current;

    if (time < this.timeFadeIn + this.fadeInDuration) {
      this.#content.alpha = animate(time, this.timeFadeIn, this.timeFadeIn + this.fadeInDuration, 0, 1);
      this.#content.scale = 1;

      this.circlePiece.comboColor = this.comboColor;
    }
    else if (time < this.timeFadeOut) {
      this.#content.alpha = 1;
      this.#content.scale = 1;

      this.circlePiece.comboColor = this.comboColor;
    }
    else {
      const hitAnimationsEnabled = this.preferences.viewport.hitAnimations;

      this.#content.alpha
        = hitAnimationsEnabled
          ? animate(time, this.timeFadeOut, this.timeFadeOut + 240, 0.9, 0)
          : animate(time, this.timeFadeOut, this.timeFadeOut + 700, 0.9, 0, Easing.inQuad);

      this.#content.scale
        = hitAnimationsEnabled
          ? animate(time, this.timeFadeOut, this.timeFadeOut + 240, 1, 1.4)
          : 1;

      this.circlePiece.comboColor = 0xFFFFFF;
    }
  }
}
