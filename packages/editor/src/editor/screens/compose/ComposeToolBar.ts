import type { Bindable } from 'osucad-framework';
import type { ComposeTool } from './tools/ComposeTool';
import { OsucadConfigManager, OsucadSettings } from '@osucad/common';
import { Anchor, Axes, Container, dependencyLoader, FillDirection, FillFlowContainer, Key, resolved, Vec2 } from 'osucad-framework';
import { OsucadIcons } from '../../../OsucadIcons';
import { ComposeToggleButton } from './ComposeToggleButton';
import { ComposeToolbarButton } from './ComposeToolbarButton';
import { ComposeToolbarToolButton } from './ComposeToolbarToolButton';
import { SampleSetControl } from './SampleSetControl';
import { SliderPresetButton } from './SliderPresetButton';
import { ToolbarGridSnapToggle } from './ToolbarGridSnapToggle';
import { BirdSliderTool } from './tools/BirdSliderTool';
import { HitCircleTool } from './tools/HitCircleTool';
import { SelectTool } from './tools/SelectTool';
import { SliderTool } from './tools/SliderTool';
import { SpinnerTool } from './tools/SpinnerTool';
import { WaveSliderTool } from './tools/WaveSliderTool';
import { ZWaveSliderTool } from './tools/ZWaveSliderTool';

export class ComposeToolBar extends Container {
  constructor(protected readonly activeTool: Bindable<ComposeTool>) {
    super({
      relativeSizeAxes: Axes.Y,
      width: ComposeToolbarButton.SIZE + 20,
      padding: 10,
    });

    this.drawNode.enableRenderGroup();

    this.addInternal(this.#toolButtons);
  }

  @dependencyLoader()
  init() {
    this.#toolButtons.add(new SampleSetControl());
    this.#toolButtons.add(new SampleSetControl('Additions', true));
    this.#toolButtons.add(
      new Container({
        height: 4,
      }),
    );
    this.#toolButtons.add(
      new ComposeToolbarToolButton({
        activeTool: this.activeTool,
        tool: new SelectTool(),
        keyBinding: Key.Digit1,
      }),
    );
    this.#toolButtons.add(
      new ComposeToolbarToolButton({
        activeTool: this.activeTool,
        tool: new HitCircleTool(),
        keyBinding: Key.Digit2,
      }),
    );
    this.#toolButtons.add(
      new ComposeToolbarToolButton({
        activeTool: this.activeTool,
        tool: new SliderTool(),
        keyBinding: Key.Digit3,
        children: [
          new SliderPresetButton({
            activeTool: this.activeTool,
            tool: new WaveSliderTool(),
          }),
          new SliderPresetButton({
            activeTool: this.activeTool,
            tool: new ZWaveSliderTool(),
          }),
          new SliderPresetButton({
            activeTool: this.activeTool,
            tool: new BirdSliderTool(),
          }),
        ],
      }),
    );
    this.#toolButtons.add(
      new ComposeToolbarToolButton({
        activeTool: this.activeTool,
        tool: new SpinnerTool(),
        keyBinding: Key.Digit4,
      }),
    );

    this.addInternal(this.#toggleButtons.with({
      depth: 1,
      children: [
        new ComposeToggleButton(OsucadIcons.get('cursorpath')).adjust(
          it => this.config.bindWith(OsucadSettings.ShowGameplayCursor, it.active),
        ),
        new ToolbarGridSnapToggle(),
      ],
    }));
  }

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  override get content() {
    return this.#toolButtons;
  }

  #toolButtons = new FillFlowContainer({
    relativeSizeAxes: Axes.Both,
    direction: FillDirection.Vertical,
    spacing: new Vec2(6),
  });

  #toggleButtons = new FillFlowContainer({
    relativeSizeAxes: Axes.X,
    autoSizeAxes: Axes.Y,
    direction: FillDirection.Vertical,
    spacing: new Vec2(6),
    anchor: Anchor.BottomLeft,
    origin: Anchor.BottomLeft,
  });

  collapseChildren() {
    const sampleSetControls = this.findChildrenOfType(SampleSetControl);
    for (const control of sampleSetControls) {
      control.expanded.value = false;
    }
  }
}
