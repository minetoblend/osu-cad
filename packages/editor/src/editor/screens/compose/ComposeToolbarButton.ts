import type { ClickEvent, DrawableOptions, MouseDownEvent, MouseUpEvent, ScheduledDelegate } from 'osucad-framework';
import type { Graphics, Texture } from 'pixi.js';
import {
  Anchor,
  Axes,
  BindableBoolean,
  Button,
  ClickableContainer,
  Container,
  dependencyLoader,
  DrawableSprite,
  EasingFunction,
  FastRoundedBox,
  MouseButton,
  resolved,
  RoundedBox,
  Vec2,
  Visibility,
} from 'osucad-framework';
import { GraphicsDrawable } from '../../../drawables/GraphicsDrawable';
import { UISamples } from '../../../UISamples';
import { ThemeColors } from '../../ThemeColors';
import { ComposeToolbarButtonSubmenu } from './ComposeToolbarButtonSubmenu';

export class ComposeToolbarButton extends Button {
  constructor(
    icon: Texture,
  ) {
    super();

    this.size = new Vec2(ComposeToolbarButton.SIZE);

    this.#iconTexture = icon;
  }

  static readonly SIZE = 54;

  @resolved(ThemeColors)
  theme!: ThemeColors;

  #iconTexture: Texture;

  get iconTexture() {
    return this.#iconTexture;
  }

  set iconTexture(value: Texture) {
    this.#iconTexture = value;
    if (this.#icon) {
      this.#icon.texture = value;
    }
  }

  @dependencyLoader()
  init() {
    this.addAllInternal(
      this.backgroundContainer = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
          (this.#background = new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 8,
            color: this.theme.translucent,
            alpha: 0.8,
            anchor: Anchor.Center,
            origin: Anchor.Center,
          })),
          (this.#outline = new RoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 8,
            fillAlpha: 0,
            anchor: Anchor.Center,
            origin: Anchor.Center,
          })),
        ],
      }),
      (this.#content = new Container({
        relativeSizeAxes: Axes.Both,
      })),
      this.scaleContainer = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
          (this.#icon = new DrawableSprite({
            texture: this.#iconTexture,
            relativeSizeAxes: Axes.Both,
            size: 0.65,
            anchor: Anchor.Center,
            origin: Anchor.Center,
          })),
        ],
      }),
    );

    this.active.valueChanged.addListener(this.updateState, this);
  }

  protected loadComplete() {
    super.loadComplete();

    this.updateState();
  }

  backgroundContainer!: Container;

  #background!: FastRoundedBox;

  #outline!: RoundedBox;

  #content!: Container;

  #icon!: DrawableSprite;

  protected scaleContainer!: Container;

  get content() {
    return this.#content;
  }

  #outlineVisibility = 0;

  get outlineVisibility() {
    return this.#outlineVisibility;
  }

  set outlineVisibility(value: number) {
    if (value === this.#outlineVisibility)
      return;

    this.#outlineVisibility = value;
    this.#outline.alpha = value;

    this.#outline.drawNode.visible = value > 0;

    this.#updateOutline();
  }

  #updateOutline() {
    if (this.outlineVisibility === 0) {
      this.#outline.outlines = [];
    }
    else {
      this.#outline.outlines = [
        {
          color: 0xC0BFBD,
          width: 1.5 * this.outlineVisibility,
          alpha: 0.25 * this.outlineVisibility,
          alignment: 1,
        },
        {
          color: 0x32D2AC,
          width: 1.5 * this.outlineVisibility,
          alpha: this.outlineVisibility,
          alignment: 0,
        },
      ];
    }
  }

  readonly active = new BindableBoolean();

  protected updateState() {
    if (this.active.value) {
      this.#icon.color = this.isHovered
        ? this.theme.primaryHighlight
        : this.theme.primary;

      this.#background.color = 0x303038;
      this.transformTo('outlineVisibility', 1, 200);
    }
    else {
      this.#background.color = 0x222228;
      this.#icon.color = this.isHovered ? 'white' : '#bbbec5';
      this.transformTo('outlineVisibility', 0, 200);
    }

    if (this.armed) {
      this.scaleContainer.scaleTo(0.85, 300, EasingFunction.OutQuart);

      // resizing the background and outline instead of main body to make sure layout isn't affected
      this.backgroundContainer.scaleTo(0.95, 300, EasingFunction.OutQuart);
    }
    else {
      this.scaleContainer.scaleTo(1, 300, EasingFunction.OutBack);

      this.backgroundContainer.scaleTo(1, 300, EasingFunction.OutBack);
    }
  }

  @resolved(UISamples)
  samples!: UISamples;

  onHover(): boolean {
    this.samples.toolHover.play({
      volume: 0.5,
    });
    this.updateState();
    return true;
  }

  onHoverLost(): boolean {
    this.updateState();
    return true;
  }

  #showSubmenuDelegate?: ScheduledDelegate;

  #preventNextClick = false;

  onMouseDown(e: MouseDownEvent): boolean {
    if (!super.onMouseDown(e))
      return false;

    if (e.button === MouseButton.Left) {
      this.#showSubmenuDelegate = this.scheduler.addDelayed(() => {
        this.getContainingFocusManager()!.changeFocus(this);
        this.submenu?.show();
        this.#preventNextClick = true;
      }, 400);
    }

    if (e.button === MouseButton.Right) {
      this.getContainingFocusManager()!.changeFocus(this);
      this.submenu?.show();
    }

    this.samples.toolSelect.play();
    this.armed = true;
    this.updateState();

    return true;
  }

  onMouseUp(e: MouseUpEvent) {
    this.#showSubmenuDelegate?.cancel();

    if (e.button === MouseButton.Left) {
      if (this.submenu?.state.value === Visibility.Visible) {
        for (const child of this.submenu.children) {
          if (child.isHovered && child instanceof ClickableContainer) {
            child.action?.();
            break;
          }
        }
      }
    }

    this.armed = false;
    this.updateState();
  }

  #armed = false;

  get armed() {
    return this.#armed;
  }

  protected set armed(value) {
    if (value === this.#armed)
      return;

    this.#armed = value;

    this.updateState();
  }

  get acceptsFocus(): boolean {
    return true;
  }

  submenu?: ComposeToolbarButtonSubmenu;

  protected addSubmenu(childItems: ComposeToolbarButton[]) {
    this.add(
      this.submenu = new ComposeToolbarButtonSubmenu(childItems).with({
        depth: 1,
      }),
    );
    this.backgroundContainer.add(
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: 6,
        child: new SubmenuCaret({
          width: 8,
          height: 8,
          anchor: Anchor.BottomRight,
          origin: Anchor.BottomRight,
        }),
      }),
    );
  }

  override onClick(e: ClickEvent): boolean {
    if (this.#preventNextClick) {
      this.#preventNextClick = false;

      return true;
    }

    return super.onClick(e);
  }

  onFocusLost() {
    this.submenu?.hide();
  }
}

class SubmenuCaret extends GraphicsDrawable {
  constructor(options: DrawableOptions) {
    super();

    this.with(options);
  }

  updateGraphics(g: Graphics) {
    g.clear();

    g.roundShape([
      { x: this.drawSize.x, y: 0 },
      { x: this.drawSize.x, y: this.drawSize.y, radius: 2 },
      { x: 0, y: this.drawSize.y },
    ], 1)
      .fill(0xFFFFFF);
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.color = this.colors.text;
  }
}
