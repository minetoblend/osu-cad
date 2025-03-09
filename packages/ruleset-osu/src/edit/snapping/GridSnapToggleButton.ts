import type { IHasTooltip } from '@osucad/core';
import type { Bindable, Drawable, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, KeyBindingReleaseEvent } from '@osucad/framework';
import { EditorAction, OsucadColors, ToolbarToggleButton } from '@osucad/core';
import { Anchor, Axes, DrawableSprite } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { PixelateFilter } from 'pixi-filters';
import { GridSizeButton } from './GridSizeButton';

export class GridSnapToggleButton extends ToolbarToggleButton implements IKeyBindingHandler<EditorAction>, IHasTooltip {
  constructor(bindable: Bindable<boolean>) {
    super([
      new GridSizeButton(0),
      new GridSizeButton(4),
      new GridSizeButton(8),
      new GridSizeButton(16),
      new GridSizeButton(32),
      new GridSizeButton(64),
    ]);

    this.active.bindTo(bindable);
  }

  #icon!: DrawableSprite;

  protected override createContent(): Drawable {
    return this.#icon = new DrawableSprite({
      texture: getIcon('grid'),
      relativeSizeAxes: Axes.Both,
      size: 0.65,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      color: OsucadColors.text,
      filters: [new PixelateFilter(3)],
    });
  }

  protected override updateState() {
    super.updateState();

    if (this.active.value)
      this.#icon.color = this.isHovered ? OsucadColors.primaryHighlight : OsucadColors.primary;
    else
      this.#icon.color = this.isHovered ? 0xFFFFFF : OsucadColors.text;
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof EditorAction;
  }

  #keyPressed = false;

  protected override get armed(): boolean {
    return this.#keyPressed || super.armed;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorAction>): boolean {
    if (e.repeat)
      return false;

    switch (e.pressed) {
      case EditorAction.ToggleGridSnap:
        this.active.toggle();
        this.#keyPressed = true;
        this.updateState();
        return true;
    }
    return false;
  }

  onKeyBindingReleased(e: KeyBindingReleaseEvent<EditorAction>) {
    switch (e.pressed) {
      case EditorAction.ToggleGridSnap:
        this.#keyPressed = false;
        this.updateState();
    }
  }

  readonly tooltipText = [
    'Click: Toggle grid snap',
    'Right click: Select grid size',
  ].join('\n');
}
