import type { EditorCornerContent, EditorScreen } from '@osucad/core';
import { Corner, EditorBottomBar, EditorCornerPiece, EditorMenuBar, EditorSafeArea, EditorScreenContainer, EditorScreenSelect } from '@osucad/core';
import { Anchor, Axes, BetterBackdropBlurFilter, Bindable, CompositeDrawable, Container, EasingFunction, Invalidation, LayoutMember, Vec2 } from '@osucad/framework';

export class BeatmapViewerLayout extends CompositeDrawable {
  constructor() {
    super();

    this.addLayout(this.#drawSizeBacking);

    this.relativeSizeAxes = Axes.Both;

    const filter = new BetterBackdropBlurFilter({
      strength: 15,
      quality: 3,
      antialias: 'inherit',
      resolution: devicePixelRatio,
    });
    filter.padding = 30;

    this.addAllInternal(
      this.#screenContainer = new EditorScreenContainer(),
      this.#bottomBar = new EditorBottomBar(),
      this.#topBar = new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
      }),
      new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        filters: [filter],
        children: [
          new EditorCornerPiece({
            corner: Corner.TopLeft,
            autoSizeAxes: Axes.X,
            height: 32,
            autoSizeDuration: 300,
            autoSizeEasing: EasingFunction.OutExpo,
            children: [
              new Container({ width: 80 }),
              new Container({
                autoSizeAxes: Axes.X,
                height: 25,
                padding: { right: 20 },
                child: new EditorMenuBar(),
                depth: -1,
              }),
            ],
          }),

          this.#topRightCornerPiece = new EditorCornerPiece({
            corner: Corner.TopRight,

            height: 95,
            width: 240,
            autoSizeDuration: 300,
            anchor: Anchor.TopRight,
            origin: Anchor.TopRight,
            autoSizeEasing: EasingFunction.OutExpo,
            children: [
              new Container({
                autoSizeAxes: Axes.X,
                height: 25,
                padding: { horizontal: 20 },
                anchor: Anchor.TopRight,
                origin: Anchor.TopRight,
                child: this.#screenSelect = new EditorScreenSelect(),
                depth: -1,
              }),
              this.#topRightContent = new Container({
                relativeSizeAxes: Axes.Y,
                autoSizeAxes: Axes.X,
                anchor: Anchor.TopRight,
                origin: Anchor.TopRight,
                padding: { left: 40, top: 25, bottom: 5 },
              }),
            ],
          }),
        ],
      }),
    );
  }

  readonly #drawSizeBacking = new LayoutMember(Invalidation.DrawSize);

  readonly #screenContainer: EditorScreenContainer;
  readonly #bottomBar: EditorBottomBar;
  readonly #topBar: Container;
  readonly #topRightCornerPiece: EditorCornerPiece;
  readonly #topRightContent: Container<EditorCornerContent>;

  #activeScreen?: EditorScreen;

  readonly #screenSelect: EditorScreenSelect;

  readonly safeArea = new Bindable(EditorSafeArea.default);

  protected override loadComplete() {
    super.loadComplete();

    this.#screenContainer.screenChanged.addListener((screen) => {
      this.#activeScreen?.safeAreaPadding.unbindAll();

      this.#activeScreen = screen;

      screen.safeAreaPadding.bindTo(this.safeArea);

      this.#topBar.child = screen.topBarContent;

      const topRightPrevious = this.#topRightContent.children[this.#topRightContent.children.length - 1];

      topRightPrevious?.onExiting?.(screen.topRightCornerContent);
      topRightPrevious?.expire();

      this.#topRightContent.add(
        screen.topRightCornerContent.doWhenLoaded((it) => {
          it.onEntering(topRightPrevious);
          this.schedule(() => {
            this.#topRightCornerPiece.updateSubTree();
            const width = Math.max(
              180,
              this.#topRightContent.layoutSize.x,
              this.#screenSelect.layoutSize.x + 40,
            );
            this.#topRightCornerPiece.resizeWidthTo(width, 300, EasingFunction.OutExpo);
          });
        }),
      );
    });
  }

  #topBarHeight = 0;

  override update() {
    super.update();

    const topBarHeight = this.#topBar.drawHeight;

    const safeAreas = new EditorSafeArea({
      totalSize: this.drawSize,
      topInner: this.#topBar.drawHeight,
      bottomInner: 30,
      topLeft: new Vec2(),
      topRight: this.#topRightCornerPiece.drawSize,
      bottomLeft: new Vec2(140, 48),
      bottomRight: new Vec2(140, 48),
    });

    if (topBarHeight !== this.#topBarHeight || !safeAreas.equals(this.safeArea.value)) {
      this.#topBarHeight = topBarHeight;

      this.safeArea.value = safeAreas;
    }
  }

  override show() {
    this.#bottomBar
      .moveToY(100)
      .moveToY(0, 300, EasingFunction.OutExpo);
  }

  override hide() {
    this.#bottomBar
      .moveToY(100, 200, EasingFunction.OutExpo);
  }
}
