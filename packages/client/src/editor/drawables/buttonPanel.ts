import { Component } from "@/editor/drawables/Component.ts";
import {
  IconButton,
  IconButtonOptions,
} from "@/editor/drawables/IconButton.ts";
import { Assets, Graphics, ObservablePoint } from "pixi.js";
import { Rect } from "@osucad/common";
import { Inject } from "@/editor/drawables/di";
import { EditorContext } from "@/editor/editorContext.ts";

export class ButtonPanel extends Component {
  @Inject(EditorContext)
  private readonly editor!: EditorContext;

  private undoButton = new ButtonPanelButton({
    icon: Assets.get("icon-undo"),
    action: () => this.editor.commandManager.undo(),
  });

  private redoButton = new ButtonPanelButton({
    icon: Assets.get("icon-redo"),
    action: () => this.editor.commandManager.redo(),
  });

  buttons = [[this.undoButton, this.redoButton]];

  onLoad() {
    watchEffect(() => {
      this.undoButton.disabled =
        !this.editor.commandManager.history.canUndo.value;
      this.redoButton.disabled =
        !this.editor.commandManager.history.canRedo.value;
    });

    watchEffect(() => {
      this.buttons = [
        [this.undoButton, this.redoButton],
        ...this.editor.tools.activeTool.panelButtons.value,
      ];
      this.removeChildren();
      this.addChild(...this.buttons.flatMap((b) => b));
      this.layout();
    });
  }

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    this.layout();
  }

  buttonSize = 45;

  layout() {
    if (this.size.x === 0 || this.size.y === 0) return;
    const bounds = new Rect(0, 0, this.size.x, this.size.y);

    bounds.splitBottom(this.buttonSize);

    for (let i = 0; i < this.buttons.length; i++) {
      const row = bounds.splitBottom(this.buttonSize);
      for (let j = 0; j < this.buttons[i].length; j++) {
        this.buttons[i][j].setBounds(row.splitLeft(this.buttonSize));
        row.splitLeft(5);
      }
    }
  }
}

export class ButtonPanelButton extends IconButton {
  background = new Graphics();

  constructor(options: IconButtonOptions) {
    super({
      iconScale: 0.75,
      ...options,
    });
    this.addChildAt(this.background, 0);

    this.on("pointerdown", () => {
      if (!this.disabled) this.iconScale = 0.85;
      this._onUpdate();
    });

    this.on("pointerup", () => {
      this.iconScale = 0.75;
      this._onUpdate();
    });
  }

  private _disabled = false;

  set disabled(value: boolean) {
    this._disabled = value;
    this.alpha = value ? 0.5 : 1;
  }

  get disabled() {
    return this._disabled;
  }

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    if (this.size.x === 0 || this.size.y === 0) return;
    this.background.clear().roundRect(0, 0, this.size.x, this.size.y, 5).fill({
      color: 0x1a1a20,
      alpha: 0.5,
    });
  }
}
