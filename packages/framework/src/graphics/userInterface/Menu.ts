import type { ClickEvent, HoverEvent, HoverLostEvent, MouseDownEvent } from "../../input";
import type { FocusLostEvent } from "../../input/events/FocusLostEvent";
import type { ScrollContainer } from "../containers";
import { CompositeDrawable, Container, FillDirection, FillFlowContainer } from "../containers";
import type { FillFlowContainerOptions } from "../containers/FillFlowContainer";
import type { Drawable } from "../drawables";
import { Anchor, Axes, Direction, Invalidation, InvalidationSource, LayoutMember, LoadState } from "../drawables";
import type { MenuItem } from "./MenuItem";
import { Color, type ColorSource } from "pixi.js";
import { Action } from "../../bindables";
import { Vec2 } from "../../math";
import { almostEquals } from "../../utils/almostEquals";
import { Box } from "../shapes";
import { provide, provideSelf } from "../../di/decorators";

@provideSelf()
export abstract class Menu extends CompositeDrawable
{
  @provide()
  public readonly stateChanged = new Action<MenuState>();

  protected hoverOpenDelay = 100;

  protected readonly topLevelMenu: boolean;

  protected readonly contentContainer: ScrollContainer;

  protected get itemsContainer(): FillFlowContainer
  {
    return this.#itemsFlow;
  }

  readonly #scheduled: (() => void)[] = [];

  #itemsFlow: ItemsFlow;

  protected readonly maskingContainer: Container;

  // protected IReadOnlyList<DrawableMenuItem> Children => itemsFlow.Children;

  protected get children()
  {
    return this.#itemsFlow.children;
  }

  protected readonly direction: Direction;

  #parentMenu: Menu | null = null;
  #submenu: Menu | null = null;

  public get parentMenu(): Menu | null
  {
    return this.#parentMenu;
  }

  public set parentMenu(value: Menu | null)
  {
    this.#parentMenu = value;
  }

  #background: Drawable;

  readonly #submenuContainer: Container;

  public get submenuContainer()
  {
    return this.#submenuContainer;
  }

  protected readonly positionLayout = new LayoutMember(Invalidation.Transform | Invalidation.RequiredParentSizeToFit);

  public constructor(direction: Direction, topLevelMenu: boolean = false)
  {
    super();

    this.direction = direction;
    this.topLevelMenu = topLevelMenu;

    if (topLevelMenu)
      this.#state = MenuState.Open;

    this.addAllInternal(
        (this.maskingContainer = new Container({
          label: "Our contents",
          relativeSizeAxes: Axes.Both,
          masking: true,
          children: [
            (this.#background = this.createBackground()),
            (this.contentContainer = this.createScrollContainer(direction).with({
              relativeSizeAxes: Axes.Both,
              masking: false,
              child: (this.#itemsFlow = this.createItemsFlow(
              direction === Direction.Horizontal ? FillDirection.Horizontal : FillDirection.Vertical,
              )),
            })),
          ],
        })),
        (this.#submenuContainer = new Container({
          label: "Sub menu container",
          autoSizeAxes: Axes.Both,
        })),
    );

    switch (direction)
    {
    case Direction.Horizontal:
      this.#itemsFlow.autoSizeAxes = Axes.X;
      break;
    case Direction.Vertical:
      this.#itemsFlow.autoSizeAxes = Axes.Y;
      break;
    }

    this.#itemsFlow.relativeSizeAxes = Axes.Both & ~this.#itemsFlow.autoSizeAxes;

    this.addLayout(this.positionLayout);
  }

  protected override loadComplete()
  {
    super.loadComplete();
    this.#updateState();
  }

  protected createBackground(): Drawable
  {
    return new Box({
      relativeSizeAxes: Axes.Both,
      color: "black",
    });
  }

  public get items(): readonly MenuItem[]
  {
    return (this.#itemsFlow.children as DrawableMenuItem[]).map(r => r.item);
  }

  public set items(value: MenuItem[])
  {
    while (this.#itemsFlow.children.length > 0)
    {
      this.#itemsFlow.remove(this.#itemsFlow.children[0], true);
    }
    for (const item of value)
    {
      this.add(item);
    }
  }

  public get backgroundColor(): Color
  {
    return this.#background.color;
  }

  public set backgroundColor(value: ColorSource)
  {
    this.#background.color = value;
  }

  public get scrollbarVisible()
  {
    return this.contentContainer.scrollbarVisible;
  }

  public set scrollbarVisible(value: boolean)
  {
    this.contentContainer.scrollbarVisible = value;
  }

  #maxWidth = Infinity;

  public get maxWidth()
  {
    return this.#maxWidth;
  }

  public set maxWidth(value: number)
  {
    if (almostEquals(this.#maxWidth, value))
      return;

    this.#maxWidth = value;

    this.#itemsFlow.sizeCache.invalidate();
  }

  #maxHeight = Infinity;

  public get maxHeight()
  {
    return this.#maxHeight;
  }

  public set maxHeight(value: number)
  {
    if (almostEquals(this.#maxHeight, value))
      return;

    this.#maxHeight = value;

    this.#itemsFlow.sizeCache.invalidate();
  }

  #state = MenuState.Closed;

  public get state()
  {
    return this.#state;
  }

  public set state(value: MenuState)
  {
    if (this.topLevelMenu)
    {
      this.#submenu?.close();
      return;
    }

    if (this.#state === value)
      return;

    this.#state = value;

    this.#updateState();
    this.stateChanged.emit(value);
  }

  #updateState()
  {
    if (this.loadState < LoadState.Loaded)
      return;

    this.#resetState();

    switch (this.state)
    {
    case MenuState.Closed:
      this.animateClose();

      if (this.hasFocus)
      {
        this.#scheduled.push(() => this.getContainingFocusManager()?.changeFocus(this.#parentMenu));
      }
      break;

    case MenuState.Open:
      this.contentContainer.scrollToStart(false);

      this.animateOpen();

      // We may not be present at this point, so must run on the next frame.
      if (!this.topLevelMenu)
      {
        this.#scheduled.push(() => this.getContainingFocusManager()!.changeFocus(this));
      }

      break;
    }
  }

  #resetState()
  {
    if (this.loadState < LoadState.Loaded)
      return;

    this.#submenu?.close();
    this.#itemsFlow.sizeCache.invalidate();
  }

  public add(item: MenuItem)
  {
    this.insert(this.#itemsFlow.children.length, item);
  }

  public insert(position: number, item: MenuItem)
  {
    const drawableItem = this.createDrawableMenuItem(item);
    drawableItem.clicked.addListener(this.#menuItemClicked);
    drawableItem.hovered.addListener(this.#menuItemHovered);
    drawableItem.stateChanged.addListener(s => this.#itemStateChanged(drawableItem, s));

    drawableItem.setFlowDirection(this.direction);

    const items = this.children.toSorted(
        (a, b) => this.#itemsFlow.getLayoutPosition(a) - this.#itemsFlow.getLayoutPosition(b),
    );

    for (let i = position; i < items.length; i++)
    {
      this.#itemsFlow.setLayoutPosition(items[i], i + 1);
    }

    this.#itemsFlow.insert(position, drawableItem);
    this.#itemsFlow.sizeCache.invalidate();
  }

  #itemStateChanged(item: DrawableMenuItem, state: MenuItemState)
  {
    if (state !== MenuItemState.Selected)
      return;

    if (item !== this.selectedItem && this.selectedItem !== null)
      this.selectedItem.state = MenuItemState.NotSelected;

    this.selectedItem = item;
  }

  public remove(item: MenuItem)
  {
    const items = this.children.toSorted(
        (a, b) => this.#itemsFlow.getLayoutPosition(a) - this.#itemsFlow.getLayoutPosition(b),
    );
    let removed = false;

    for (let i = 0; i < items.length; i++)
    {
      const d = items[i] as DrawableMenuItem;

      if (d.item === item)
      {
        for (let j = i + 1; j < items.length; j++)
          this.#itemsFlow.setLayoutPosition(items[j], j - 1);

        this.#itemsFlow.remove(d, true);
        items.splice(i--, 1);
        removed = true;
      }
    }

    this.#itemsFlow.sizeCache.invalidate();
    return removed;
  }

  // TODO: clear()

  public open()
  {
    this.state = MenuState.Open;
  }

  public close()
  {
    this.state = MenuState.Closed;
  }

  public toggle()
  {
    this.state = this.state === MenuState.Open ? MenuState.Closed : MenuState.Open;
  }

  public animateOpen()
  {
    this.show();
  }

  public animateClose()
  {
    this.hide();
  }

  public override update(): void
  {
    super.update();

    if (!this.positionLayout.isValid && this.state === MenuState.Open && this.#parentMenu !== null)
    {
      const inputManager = this.getContainingInputManager()!;

      if (this.triggeringItem?.isDisposed)
      {
        this.positionLayout.validate();
        this.close();
        return;
      }

      const triggeringItemTopLeftPosition = this.triggeringItem!.toSpaceOfOtherDrawable(Vec2.zero(), this.#parentMenu);

      const menuMaximumPosition = this.triggeringItem!.toSpaceOfOtherDrawable(
          new Vec2(this.triggeringItem!.drawSize.x + this.drawSize.x, this.triggeringItem!.drawSize.y + this.drawSize.y),
          inputManager,
      );

      const menuMinimumPosition = this.triggeringItem!.toSpaceOfOtherDrawable(
          new Vec2(-this.drawScale.x, -this.drawScale.y),
          inputManager,
      );

      const parentSubmenuContainer = this.#parentMenu.submenuContainer;

      if (this.#parentMenu.direction === Direction.Vertical)
      {
        if (menuMaximumPosition.x > inputManager.drawSize.x && menuMinimumPosition.x > 0)
        {
          // switch the origin and position of the submenu container so that it's right-aligned to the left side of the triggering item.
          parentSubmenuContainer.origin = switchAxisAnchors(parentSubmenuContainer.origin, Anchor.x0, Anchor.x2);
          parentSubmenuContainer.x = triggeringItemTopLeftPosition.x;
        }
        else
        {
          // otherwise, switch the origin and position of the submenu container so that it's left-aligned to the right side of the triggering item.
          parentSubmenuContainer.origin = switchAxisAnchors(parentSubmenuContainer.origin, Anchor.x2, Anchor.x0);
          parentSubmenuContainer.x = triggeringItemTopLeftPosition.x + this.triggeringItem!.drawSize.x;
        }

        // If this menu won't fit on the screen vertically if its top edge is aligned to the top of the triggering item,
        // but it will fit if its bottom edge is aligned to the bottom of the triggering item...
        if (menuMaximumPosition.y > inputManager.drawSize.y && menuMinimumPosition.y > 0)
        {
          // switch the origin and position of the submenu container so that it's bottom-aligned to the bottom of the triggering item.
          parentSubmenuContainer.origin = switchAxisAnchors(parentSubmenuContainer.origin, Anchor.y0, Anchor.y2);
          parentSubmenuContainer.y = triggeringItemTopLeftPosition.y + this.triggeringItem!.drawSize.y;
        }
        else
        {
          // otherwise, switch the origin and position of the submenu container so that it's top-aligned to the top of the triggering item.
          parentSubmenuContainer.origin = switchAxisAnchors(parentSubmenuContainer.origin, Anchor.y2, Anchor.y0);
          parentSubmenuContainer.y = triggeringItemTopLeftPosition.y;
        }
      }
      // the "horizontal" case is the same as above, but with the axes everywhere swapped.
      else
      {
        if (menuMaximumPosition.y > inputManager.drawSize.y && menuMinimumPosition.y > 0)
        {
          parentSubmenuContainer.origin = switchAxisAnchors(parentSubmenuContainer.origin, Anchor.y0, Anchor.y2);
          parentSubmenuContainer.y = triggeringItemTopLeftPosition.y;
        }
        else
        {
          parentSubmenuContainer.origin = switchAxisAnchors(parentSubmenuContainer.origin, Anchor.y2, Anchor.y0);
          parentSubmenuContainer.y = triggeringItemTopLeftPosition.y + this.triggeringItem!.drawSize.y;
        }

        if (menuMaximumPosition.x > inputManager.drawSize.x && menuMinimumPosition.x > 0)
        {
          parentSubmenuContainer.origin = switchAxisAnchors(parentSubmenuContainer.origin, Anchor.x0, Anchor.x2);
          parentSubmenuContainer.x = triggeringItemTopLeftPosition.x + this.triggeringItem!.drawSize.x;
        }
        else
        {
          parentSubmenuContainer.origin = switchAxisAnchors(parentSubmenuContainer.origin, Anchor.x2, Anchor.x0);
          parentSubmenuContainer.x = triggeringItemTopLeftPosition.x;
        }
      }

      this.positionLayout.validate();
    }

    for (const scheduled of this.#scheduled)
    {
      scheduled();
    }
    this.#scheduled.length = 0;
  }

  protected override updateAfterChildren()
  {
    super.updateAfterChildren();

    if (!this.#itemsFlow.sizeCache.isValid)
    {
      let width = 0;
      let height = 0;

      for (const item of this.children as DrawableMenuItem[])
      {
        width = Math.max(width, item.contentDrawWidth);
        height = Math.max(height, item.contentDrawHeight);
      }

      width = this.direction === Direction.Horizontal ? this.#itemsFlow.width : width;
      height = this.direction === Direction.Vertical ? this.#itemsFlow.height : height;

      width = Math.min(this.maxWidth, width);
      height = Math.min(this.maxHeight, height);

      width = this.relativeSizeAxes & Axes.X ? this.width : width;
      height = this.relativeSizeAxes & Axes.Y ? this.height : height;

      if (this.state === MenuState.Closed && this.direction === Direction.Horizontal)
      {
        width = 0;
      }
      if (this.state === MenuState.Closed && this.direction === Direction.Vertical)
      {
        height = 0;
      }

      this.updateSize(new Vec2(width, height));

      this.#itemsFlow.sizeCache.validate();
    }
  }


  protected updateSize(newSize: Vec2)
  {
    this.size = newSize;
  }

  #menuItemClicked = (item: DrawableMenuItem) =>
  {
    if (this.topLevelMenu && this.#submenu?.state === MenuState.Open)
    {
      this.#submenu.close();
      return;
    }

    // Check if there is a sub menu to display
    if (item.item.items.length === 0)
    {
      // This item must have attempted to invoke an action - close all menus if item allows
      if (item.closeMenuOnClick)
        this.#closeAll();

      return;
    }

    if (this.#openTimeout)
      clearTimeout(this.#openTimeout);

    this.#openSubmenuFor(item);
  };

  public selectedItem: DrawableMenuItem | null = null;

  public triggeringItem: DrawableMenuItem | null = null;

  #openSubmenuFor(item: DrawableMenuItem)
  {
    item.state = MenuItemState.Selected;

    if (this.#submenu === null)
    {
      this.#submenuContainer.add((this.#submenu = this.createSubmenu()));
      this.#submenu!.parentMenu = this;
      this.#submenu!.stateChanged.addListener(this.#submenuStateChanged);
    }

    this.#submenu!.triggeringItem = item;
    this.#submenu!.positionLayout.invalidate();

    this.#submenu!.items = [...item.item.items];

    if (item.item.items.length > 0)
    {
      if (this.#submenu!.state === MenuState.Open)
        this.#scheduled.push(() => this.getContainingFocusManager()!.changeFocus(this.#submenu));
      else
        this.#submenu!.open();
    }
    else
    {
      this.#submenu!.close();
    }
  }

  #submenuStateChanged = (state: MenuState) =>
  {
    switch (state)
    {
    case MenuState.Closed:
      this.selectedItem!.state = MenuItemState.NotSelected;
      break;

    case MenuState.Open:
      this.selectedItem!.state = MenuItemState.Selected;
      break;
    }
  };

  #openTimeout?: ReturnType<typeof setTimeout>;

  protected get openOnHover()
  {
    return !this.topLevelMenu;
  }

  #menuItemHovered = (item: DrawableMenuItem) =>
  {
    if (!this.openOnHover && this.#submenu?.state !== MenuState.Open)
    {
      return;
    }

    if (this.#openTimeout)
    {
      clearTimeout(this.#openTimeout);
      this.#openTimeout = undefined;
    }

    if (this.topLevelMenu || this.hoverOpenDelay === 0)
    {
      this.#openSubmenuFor(item);
    }
    else
    {
      this.#openTimeout = setTimeout(() =>
      {
        if (item.isHovered)
        {
          this.#openSubmenuFor(item);
        }
      }, this.hoverOpenDelay);
    }
  };

  public override get handleNonPositionalInput()
  {
    return this.state === MenuState.Open;
  }

  // TODO: OnKeyDown

  protected override onMouseDown(e: MouseDownEvent): boolean
  {
    return true;
  }

  protected override onClick(e: ClickEvent): boolean
  {
    return true;
  }

  protected override onHover(e: HoverEvent): boolean
  {
    return true;
  }

  public override get acceptsFocus(): boolean
  {
    return !this.topLevelMenu;
  }

  public override get requestsFocus(): boolean
  {
    return !this.topLevelMenu && this.state === MenuState.Open;
  }

  protected override onFocusLost(e: FocusLostEvent): boolean
  {
    if (this.#submenu?.state === MenuState.Open)
      return false;

    if (!this.topLevelMenu)
    {
      this.#closeAll();
    }

    return false;
  }

  #closeAll()
  {
    this.close();
    this.#parentMenu?.closeFromChild(this.triggeringItem!.item);
  }

  public closeFromChild(source: MenuItem)
  {
    if (this.isHovered || (this.#parentMenu?.isHovered ?? false))
      return;

    if (this.triggeringItem?.item.items.includes(source) ?? this.triggeringItem === null)
    {
      this.close();
      this.#parentMenu?.closeFromChild(this.triggeringItem!.item);
    }
  }

  protected abstract createSubmenu(): Menu;

  protected abstract createDrawableMenuItem(item: MenuItem): DrawableMenuItem;

  protected abstract createScrollContainer(direction: Direction): ScrollContainer;

  protected createItemsFlow(direction: FillDirection)
  {
    return new ItemsFlow({ direction });
  }
}

export abstract class DrawableMenuItem extends CompositeDrawable
{
  public readonly stateChanged = new Action<MenuItemState>();

  public readonly clicked = new Action<DrawableMenuItem>();

  public readonly hovered = new Action<DrawableMenuItem>();

  public readonly item: MenuItem;

  public content!: Drawable;

  protected background!: Drawable;

  protected foreground!: Drawable;

  public get closeMenuOnClick()
  {
    return true;
  }

  #scheduled: (() => void)[] = [];

  protected constructor(item: MenuItem)
  {
    super();

    this.item = item;

    this.withScope(() =>
    {
      item.disabled.addOnChangeListener(() =>
      {
        this.updateBackgroundColor();
        this.updateForegroundColor();
      });

      item.action.addOnChangeListener(() =>
      {
        this.updateBackgroundColor();
        this.updateForegroundColor();
      });

      this.addAllInternal(
          (this.background = this.createBackground()),
          (this.foreground = new Container({
            autoSizeAxes: Axes.Both,
            child: (this.content = this.createContent()),
          })),
      );

      if ("text" in this.content)
      {
        this.content.text = item.text.value;
        item.text.addOnChangeListener((e) =>
        {
          (this.content as unknown as { text: string }).text = e.value;
        });
      }
    });
  }

  protected override update(): void
  {
    super.update();

    for (const scheduled of this.#scheduled)
    {
      scheduled();
    }
    this.#scheduled.length = 0;
  }

  public setFlowDirection(direction: Direction)
  {
    this.relativeSizeAxes = direction === Direction.Horizontal ? Axes.Y : Axes.X;
    this.autoSizeAxes = direction === Direction.Horizontal ? Axes.X : Axes.Y;
  }

  #backgroundColor = new Color("rgb(47, 79, 79)");

  public get backgroundColor()
  {
    return this.#backgroundColor;
  }

  public set backgroundColor(value: ColorSource)
  {
    this.#backgroundColor.setValue(value);
    this.updateBackgroundColor();
  }

  #foregroundColor = new Color("white");

  public get foregroundColor()
  {
    return this.#foregroundColor;
  }

  public set foregroundColor(value: ColorSource)
  {
    this.#foregroundColor.setValue(value);
    this.updateForegroundColor();
  }

  #backgroundColorHover = new Color("rgb(169, 169, 169)");

  public get backgroundColorHover()
  {
    return this.#backgroundColorHover;
  }

  public set backgroundColorHover(value: ColorSource)
  {
    this.#backgroundColorHover.setValue(value);
    this.updateBackgroundColor();
  }

  #foregroundColorHover = new Color("white");

  public get foregroundColorHover()
  {
    return this.#foregroundColorHover;
  }

  public set foregroundColorHover(value: ColorSource)
  {
    this.#foregroundColorHover.setValue(value);
    this.updateForegroundColor();
  }

  #state = MenuItemState.NotSelected;

  public get state()
  {
    return this.#state;
  }

  public set state(value: MenuItemState)
  {
    this.#state = value;

    this.stateChanged.emit(value);

    this.updateBackgroundColor();
    this.updateForegroundColor();
  }

  public get contentDrawWidth()
  {
    return this.content.drawWidth;
  }

  public get contentDrawHeight()
  {
    return this.content.drawHeight;
  }

  public get isActionable()
  {
    return this.#hasSubmenu || (!this.item.disabled.value && this.item.action.value !== null);
  }

  get #hasSubmenu()
  {
    return this.item.items.length > 0;
  }

  protected updateBackgroundColor()
  {
    this.background.fadeColor(this.isHovered && this.isActionable ? this.backgroundColorHover : this.backgroundColor);
  }

  protected updateForegroundColor()
  {
    this.foreground.fadeColor(this.isHovered && this.isActionable ? this.foregroundColorHover : this.foregroundColor);
  }

  protected override loadComplete(): void
  {
    super.loadComplete();
    this.updateBackgroundColor();
    this.updateForegroundColor();
  }

  protected override onHover(e: HoverEvent): boolean
  {
    this.updateBackgroundColor();
    this.updateForegroundColor();

    this.#scheduled.push(() =>
    {
      if (this.isHovered)
      {
        this.hovered.emit(this);
      }
    });

    return false;
  }

  protected override onHoverLost(e: HoverLostEvent)
  {
    this.updateBackgroundColor();
    this.updateForegroundColor();

    super.onHoverLost(e);
  }

  protected override onClick(): boolean
  {
    if (this.#hasSubmenu)
    {
      this.clicked.emit(this);
      return true;
    }

    if (!this.isActionable)
      return true;

    this.item.action.value?.();
    this.clicked?.emit(this);

    return true;
  }

  protected createBackground(): Drawable
  {
    return new Box({
      relativeSizeAxes: Axes.Both,
    });
  }

  protected abstract createContent(): Drawable;
}

export enum MenuState
{
  Open,
  Closed,
}

export enum MenuItemState
{
  NotSelected,
  Selected,
}

function switchAxisAnchors(originalValue: Anchor, toDisable: Anchor, toEnable: Anchor)
{
  return (originalValue & ~toDisable) | toEnable;
}

class ItemsFlow extends FillFlowContainer
{
  public readonly sizeCache = new LayoutMember(Invalidation.RequiredParentSizeToFit, InvalidationSource.Self);

  public constructor(options: FillFlowContainerOptions = {})
  {
    super(options);
    this.addLayout(this.sizeCache);
  }
}
