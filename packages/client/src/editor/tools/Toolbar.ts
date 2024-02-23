import { Component } from '../drawables/Component.ts';
import { Box } from '../drawables/Box.ts';
import { Assets, ObservablePoint } from 'pixi.js';
import { Inject } from '../drawables/di';
import { Rect } from '@osucad/common';
import { ToolButton } from './ToolButton.ts';
import { SelectTool } from './SelectTool.ts';
import { HitCircleTool } from './HitCircleTool.ts';
import { SliderTool } from './SliderTool.ts';
import { SpinnerTool } from './SpinnerTool.ts';
import { isMobile } from '@/util/isMobile.ts';
import { EditorContext } from '@/editor/editorContext.ts';
import { ComposeTool } from '@/editor/tools/ComposeTool.ts';
import { ToolbarButton } from '@/editor/tools/ToolbarButton.ts';
import { usePreferencesVisible } from '@/composables/usePreferencesVisible.ts';
import { onEditorKeyDown } from '@/composables/onEditorKeyDown.ts';

export class Toolbar extends Component {
  @Inject(EditorContext)
  private readonly editor!: EditorContext;

  private readonly background = new Box({
    tint: 0x1a1a20,
  });

  private buttons: ToolButton[] = [
    new ToolButton({
      icon: Assets.get('icon-select'),
      tool: SelectTool,
    }),
    new ToolButton({
      icon: Assets.get('icon-circle'),
      tool: HitCircleTool,
    }),
    new ToolButton({
      icon: Assets.get('icon-slider'),
      tool: SliderTool,
    }),
    new ToolButton({
      icon: Assets.get('icon-spinner'),
      tool: SpinnerTool,
    }),
  ];

  preferencesButton = new ToolbarButton({
    icon: Assets.get('icon-cog'),
    action: () => {
      usePreferencesVisible().value = true;
    },
  });

  constructor() {
    super();
    if (isMobile()) this.background.visible = false;

    this.addChild(this.background, ...this.buttons, this.preferencesButton);
  }

  get tool() {
    return this.editor.tools.activeTool;
  }

  set tool(tool: ComposeTool) {
    this.editor.tools.activeTool = tool;
  }

  onLoad() {
    watchEffect(() => this.updateBounds());
    onEditorKeyDown((evt) => {
      if (this.editor.tools.activeTool.acceptsNumberKeys) return;
      if (evt.ctrlKey || evt.metaKey || evt.altKey || evt.shiftKey) return;
      switch (evt.key) {
        case '1':
          this.tool = new SelectTool();
          break;
        case '2':
          this.tool = new HitCircleTool();
          break;
        case '3':
          this.tool = new SliderTool();
          break;
        case '4':
          this.tool = new SpinnerTool();
          break;
      }
    });
  }

  updateBounds() {
    if (this.size.x === 0 || this.size.y === 0) return;
    const bounds = new Rect(0, 0, this.size.x, this.size.y);
    for (const button of this.buttons) {
      button.setBounds(bounds.splitTop(48));
    }
    this.preferencesButton.setBounds(bounds.splitBottom(48));
  }

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    this.background.scale.copyFrom(this.size);
  }
}
