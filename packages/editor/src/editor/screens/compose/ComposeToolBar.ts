import type { Bindable } from 'osucad-framework';
import { Axes, Container, FillDirection, FillFlowContainer, Key, Vec2, dependencyLoader } from 'osucad-framework';
import { ComposeToolbarToolButton } from './ComposeToolbarToolButton';
import { SliderPresetButton } from './SliderPresetButton';
import type { ComposeTool } from './tools/ComposeTool';
import { SelectTool } from './tools/SelectTool';
import { HitCircleTool } from './tools/HitCircleTool';
import { SliderTool } from './tools/SliderTool';
import { SpinnerTool } from './tools/SpinnerTool';
import { ZWaveSliderTool } from './tools/ZWaveSliderTool';
import { WaveSliderTool } from './tools/WaveSliderTool';
import { BirdSliderTool } from './tools/BirdSliderTool';
import { ComposeToolbarButton } from './ComposeToolbarButton';
import { SampleSetControl } from './SampleSetControl.ts';

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
      })
    )
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
  }

  override get content() {
    return this.#toolButtons;
  }

  #toolButtons = new FillFlowContainer({
    relativeSizeAxes: Axes.Both,
    direction: FillDirection.Vertical,
    spacing: new Vec2(6),
  });

  #toggleButtons = new FillFlowContainer({
    relativeSizeAxes: Axes.Both,
    direction: FillDirection.Vertical,
    spacing: new Vec2(6),
  });
}
