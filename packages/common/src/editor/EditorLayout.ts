import { Axes, CompositeDrawable, dependencyLoader, EasingFunction, Invalidation, LayoutMember } from 'osucad-framework';
import { EditorBottomBar } from './bottomBar/EditorBottomBar';
import { EditorHeader } from './header/EditorHeader';
import { EditorScreenContainer } from './screens/EditorScreenContainer';

export class EditorLayout extends CompositeDrawable {
  constructor() {
    super();

    this.addLayout(this.#drawSizeBacking);
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.Both;

    this.internalChildren = [
      this.#screenContainer = new EditorScreenContainer(),
      this.#bottomBar = new EditorBottomBar(),
      this.#header = new EditorHeader(),
    ];
  }

  readonly #drawSizeBacking = new LayoutMember(Invalidation.DrawSize);

  #header!: EditorHeader;

  #bottomBar!: EditorBottomBar;

  #screenContainer!: EditorScreenContainer;

  override update() {
    super.update();

    if (!this.#drawSizeBacking.isValid) {
      this.#screenContainer.padding = {
        top: this.#header.drawHeight,
        bottom: this.#bottomBar.drawHeight,
      };

      this.#drawSizeBacking.validate();
    }
  }

  override show() {
    this.#bottomBar
      .moveToY(100)
      .moveToY(0, 300, EasingFunction.OutExpo);

    this.#header
      .moveToY(-50)
      .moveToY(0, 300, EasingFunction.OutExpo);
  }

  override hide() {
    this.#bottomBar
      .moveToY(100, 200, EasingFunction.OutExpo);

    this.#header
      .moveToY(-50, 200, EasingFunction.OutExpo);
  }
}
