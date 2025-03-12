import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { EditorBottomBar, EditorSafeArea, type EditorScreen, EditorScreenContainer } from '@osucad/core';
import { Axes, Bindable, CompositeDrawable, Container, Vec2 } from '@osucad/framework';

export class PlaceEditorLayout extends CompositeDrawable {
  protected load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    this.internalChildren = [
      new Container({
        relativeSizeAxes: Axes.Both,
        child: this.#screenContainer = new EditorScreenContainer(),
      }),
      new EditorBottomBar(),
    ];
  }

  #screenContainer!: EditorScreenContainer;
  #activeScreen?: EditorScreen;

  readonly safeArea = new Bindable(EditorSafeArea.default);

  protected loadComplete() {
    super.loadComplete();

    this.#screenContainer.screenChanged.addListener((screen) => {
      this.#activeScreen?.safeAreaPadding.unbindAll();

      this.#activeScreen = screen;

      screen.safeAreaPadding.bindTo(this.safeArea);
    });
  }

  update() {
    super.update();

    const safeArea = new EditorSafeArea({
      totalSize: this.drawSize,
      topInner: 0,
      bottomInner: 30,
      topLeft: new Vec2(),
      topRight: new Vec2(),
      bottomLeft: new Vec2(140, 48),
      bottomRight: new Vec2(140, 48),
    });

    if (!safeArea.equals(this.safeArea.value))
      this.safeArea.value = safeArea;
  }
}
