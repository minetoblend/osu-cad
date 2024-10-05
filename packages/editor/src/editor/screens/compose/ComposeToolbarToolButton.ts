import type { Bindable, Key, KeyDownEvent, MouseDownEvent, MouseUpEvent } from 'osucad-framework';
import type { ComposeTool } from './tools/ComposeTool';
import { MouseButton } from 'osucad-framework';
import { ComposeToolbarButton } from './ComposeToolbarButton';

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

  init() {
    super.init();

    if (this.childItems.length > 0)
      this.addSubmenu(this.childItems);

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
    }

    return super.onMouseDown(e);
  }

  onMouseUp(e: MouseUpEvent) {
    if (e.button === MouseButton.Left) {
      this.#mouseDownTime = null;
    }

    super.onMouseUp(e);
  }

  override update() {
    super.update();
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (this.keyBinding && e.key === this.keyBinding && !e.controlPressed && !e.shiftPressed && !e.altPressed) {
      this.armed = true;
      this.triggerAction();
    }

    return false;
  }

  onKeyUp(e: KeyDownEvent) {
    if (this.keyBinding && e.key === this.keyBinding) {
      this.armed = false;
    }
  }
}
