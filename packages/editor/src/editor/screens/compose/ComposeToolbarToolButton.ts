import type {
  Bindable,
  ClickEvent,
  DrawableOptions,
  Key,
  KeyDownEvent,
  MouseDownEvent,
  MouseUpEvent,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  ClickableContainer,
  Container,
  MouseButton,
  Visibility,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import type { Graphics } from 'pixi.js';
import { GraphicsDrawable } from '../../../drawables/GraphicsDrawable';
import { ThemeColors } from '../../ThemeColors';
import { ComposeToolbarButton } from './ComposeToolbarButton';
import { ComposeToolbarButtonSubmenu } from './ComposeToolbarButtonSubmenu';
import type { ComposeTool } from './tools/ComposeTool';

export interface ComposeToolbarToolButtonOptions {
  tool: ComposeTool;
  activeTool: Bindable<ComposeTool>;
  keyBinding?: Key;
  children?: ComposeToolbarButton[];
}

export class ComposeToolbarToolButton extends ComposeToolbarButton {
  constructor(options: ComposeToolbarToolButtonOptions) {
    super(options.tool.icon);

    this.activeTool = options.activeTool;
    this.tool = options.tool;
    this.keyBinding = options.keyBinding;

    this.action = () => {
      this.activeTool.setValue(this.activeTool.value, this.tool);
      this.submenu?.hide();
    };

    if (options.children) {
      this.childItems = options.children;
    }
  }

  readonly activeTool: Bindable<ComposeTool>;
  readonly tool: ComposeTool;

  readonly keyBinding?: Key;

  childItems: ComposeToolbarButton[] = [];

  submenu?: ComposeToolbarButtonSubmenu;

  init() {
    super.init();

    if (this.childItems.length > 0) {
      this.addAll(
        this.submenu = new ComposeToolbarButtonSubmenu(this.childItems).with({
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

    this.activeTool.addOnChangeListener(
      ({ value: tool }) => {
        this.active.value = this.tool.isActive(tool);

        if (!this.active.value) {
          this.submenu?.hide();
          this.iconTexture = this.tool.icon;
        }
        else {
          this.iconTexture = tool.icon;
        }
      },
      { immediate: true },
    );
  }

  #mouseDownTime: number | null = null;

  onMouseDown(e: MouseDownEvent): boolean {
    switch (e.button) {
      case MouseButton.Left:
        this.#mouseDownTime = this.time.current;
        break;
      case MouseButton.Right:
        this.getContainingFocusManager()!.changeFocus(this);
        this.submenu?.show();
        break;
    }

    return super.onMouseDown(e);
  }

  onMouseUp(e: MouseUpEvent) {
    if (e.button === MouseButton.Left) {
      this.#mouseDownTime = null;

      if (this.submenu?.state.value === Visibility.Visible) {
        for (const child of this.submenu.children) {
          if (child.isHovered && child instanceof ClickableContainer) {
            child.action?.();
            break;
          }
        }
      }
    }

    super.onMouseUp(e);
  }

  longPressDuration = 400;

  #preventNextClick = false;

  override update() {
    super.update();

    if (
      this.#mouseDownTime !== null
      && this.time.current - this.#mouseDownTime > this.longPressDuration
    ) {
      this.getContainingFocusManager()!.changeFocus(this);
      this.submenu?.show();

      this.#preventNextClick = true;

      this.#mouseDownTime = null;
    }
  }

  onClick(e: ClickEvent): boolean {
    if (this.#preventNextClick) {
      this.#preventNextClick = false;

      return true;
    }

    return super.onClick(e);
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (this.keyBinding && e.key === this.keyBinding) {
      this.armed = true;
      this.triggerAction();
    }

    return false;
  }

  onKeyUp(e: KeyDownEvent) {
    if (this.keyBinding && e.key === this.keyBinding) {
      this.armed = false;
    }

    return false;
  }

  onFocusLost(): boolean {
    this.submenu?.hide();

    return true;
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
