import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { OsucadSpriteTextOptions } from './OsucadSpriteText';
import { Axes, Invalidation, LayoutMember } from 'osucad-framework';
import { OsucadSpriteText } from './OsucadSpriteText';

export class TextBlock extends OsucadSpriteText {
  constructor(options: OsucadSpriteTextOptions = {}) {
    super({
      relativeSizeAxes: Axes.X,
      ...options,
    });

    this.addLayout(this.#drawSizeBacking);
  }

  #drawSizeBacking = new LayoutMember(Invalidation.DrawSize);

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.style.wordWrap = true;
  }

  override update() {
    super.update();

    if (!this.#drawSizeBacking.isValid) {
      this.style.wordWrapWidth = this.drawWidth;
      this.height = this.textDrawNode.height;
      this.#drawSizeBacking.validate();
    }
  }

  protected override updateSize(width: number, height: number) {}
}
