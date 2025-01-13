import type { ContainerOptions, Drawable } from 'osucad-framework';
import { Axes, Container, EasingFunction, resolved, TextInputSource, Vec2 } from 'osucad-framework';

export class VirtualKeyboardSafeAreaContainer extends Container {
  constructor(options: ContainerOptions) {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.internalChild = this.#content;

    this.with(options);
  }

  readonly #content = new Container({
    relativeSizeAxes: Axes.Both,
  });

  override get content(): Container<Drawable> {
    return this.#content;
  }

  @resolved(() => TextInputSource)
  protected textInput!: TextInputSource;

  override updateAfterChildren() {
    super.updateAfterChildren();

    if (!window.visualViewport)
      return;

    let targetOffset = 0;

    if (window.visualViewport.height !== window.innerHeight && this.textInput.isActive) {
      const focusedDrawable = this.getContainingFocusManager()?.focusedDrawable;
      if (focusedDrawable) {
        const targetBottom = this.#content.toLocalSpace(focusedDrawable.screenSpaceDrawQuad.AABB.bottomLeft).y;

        const viewportHeight = this.toLocalSpace(new Vec2(0, window.visualViewport.height)).y;

        const padding = 20;

        if (targetBottom + padding > viewportHeight)
          targetOffset = viewportHeight - (targetBottom + padding);
      }
    }

    if (targetOffset !== this.#lastOffset) {
      this.#content.moveToY(targetOffset, 300, EasingFunction.OutExpo);
      this.#lastOffset = targetOffset;
    }
  }

  #lastOffset = 0;
}
