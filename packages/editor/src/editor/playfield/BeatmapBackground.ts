import type { Texture } from 'pixi.js';
import {
  Container,
  dependencyLoader,
  PIXISprite,
  resolved,
} from 'osucad-framework';
import { EditorContext } from '../context/EditorContext';

export class BeatmapBackground extends Container {
  constructor() {
    super({
      width: 512,
      height: 384,
      alpha: 0.75,
    });
  }

  @resolved(EditorContext)
  context!: EditorContext;

  @dependencyLoader()
  init() {
    this.context.backgroundBindable.addOnChangeListener(
      ({ value: texture }) => this.#updateBackground(texture),
      { immediate: true },
    );
  }

  #background: PIXISprite | null = null;

  #updateBackground(texture: Texture | null) {
    if (texture) {
      this.#background ??= this.drawNode.addChild(
        new PIXISprite({
          position: { x: 512 / 2, y: 384 / 2 },
          anchor: { x: 0.5, y: 0.5 },
        }),
      );

      this.#background.texture = texture;

      const scale = Math.max(900 / texture.width, 540 / texture.height);

      this.#background.scale.set(scale);
    }
    else {
      if (this.#background) {
        this.drawNode.removeChild(this.#background);
        this.#background = null;
      }
    }
  }
}
