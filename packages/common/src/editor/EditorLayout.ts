import type { EditorScreen } from './screens/EditorScreen';
import type { EditorCornerContent } from './ui/EditorCornerContent';
import { Anchor, Axes, BetterBackdropBlurFilter, Bindable, CompositeDrawable, Container, EasingFunction, Invalidation, LayoutMember, Vec2 } from 'osucad-framework';
import { EditorBottomBar } from './bottomBar/EditorBottomBar';
import { EditorSafeArea } from './EditorSafeArea';
import { EditorMenuBar } from './header/EditorMenuBar';
import { EditorScreenContainer } from './screens/EditorScreenContainer';
import { Corner } from './ui/Corner';
import { EditorCornerPiece } from './ui/EditorCornerPiece';
import { EditorScreenSelect } from './ui/EditorScreenSelect';

export class EditorLayout extends CompositeDrawable {
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

    this.internalChildren = [
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
          this.#topLeftCornerPiece = new EditorCornerPiece({
            corner: Corner.TopLeft,
            autoSizeAxes: Axes.X,
            height: 95,
            autoSizeDuration: 300,
            autoSizeEasing: EasingFunction.OutExpo,
            children: [
              new Container({ width: 200 }),
              new Container({
                autoSizeAxes: Axes.X,
                height: 25,
                padding: { right: 20 },
                child: new EditorMenuBar(),
                depth: -1,
              }),
              this.#topLeftContent = new Container({
                autoSizeAxes: Axes.X,
                relativeSizeAxes: Axes.Y,
                padding: { right: 25, top: 25 },
              }),
            ],
          }),
          this.#topRightCornerPiece = new EditorCornerPiece({
            corner: Corner.TopRight,
            height: 95,
            width: 240,
            anchor: Anchor.TopRight,
            origin: Anchor.TopRight,
            children: [
              new Container({
                autoSizeAxes: Axes.X,
                height: 25,
                padding: { horizontal: 20 },
                anchor: Anchor.TopRight,
                origin: Anchor.TopRight,
                child: this.#screenSelect = new EditorScreenSelect(),
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
    ];
  }

  readonly #drawSizeBacking = new LayoutMember(Invalidation.DrawSize);

  readonly #bottomBar: EditorBottomBar;

  readonly #screenContainer: EditorScreenContainer;

  readonly #topLeftContent: Container<EditorCornerContent>;

  readonly #topRightContent: Container<EditorCornerContent>;

  readonly #topBar: Container;

  readonly #topLeftCornerPiece: EditorCornerPiece;

  readonly #topRightCornerPiece: EditorCornerPiece;

  readonly #screenSelect: EditorScreenSelect;

  #activeScreen?: EditorScreen;

  protected override loadComplete() {
    super.loadComplete();

    this.#screenContainer.screenChanged.addListener((screen) => {
      this.#activeScreen?.safeAreaPadding.unbindAll();

      this.#activeScreen = screen;

      screen.safeAreaPadding.bindTo(this.safeArea);

      this.#topBar.child = screen.topBarContent;

      const topLeftPrevious = this.#topLeftContent.children[this.#topLeftContent.children.length - 1];

      topLeftPrevious?.onExiting(screen.topLeftCornerContent);
      topLeftPrevious?.expire();

      const topRightPrevious = this.#topRightContent.children[this.#topRightContent.children.length - 1];

      topRightPrevious?.onExiting?.(screen.topRightCornerContent);
      // topRightPrevious?.expire();

      this.#topLeftContent.add(
        screen.topLeftCornerContent.doWhenLoaded(it => it.onEntering(topLeftPrevious)),
      );
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

  readonly safeArea = new Bindable(EditorSafeArea.default);

  override update() {
    super.update();

    const topBarHeight = this.#topBar.drawHeight;

    const safeAreas = new EditorSafeArea({
      totalSize: this.drawSize,
      topInner: this.#topBar.drawHeight,
      bottomInner: 30,
      topLeft: this.#topLeftCornerPiece.drawSize,
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
