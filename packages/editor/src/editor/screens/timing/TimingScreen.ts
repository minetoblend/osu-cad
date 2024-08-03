import { Axes, Container, RoundedBox, dependencyLoader, resolved } from 'osucad-framework';
import { ControlPointManager } from '@osucad/common';
import { EditorScreen } from '../EditorScreen';
import { ThemeColors } from '../../ThemeColors';
import { ControlPointSelection } from './ControlPointSelection';
import { TimingPointTable } from './TimingPointTable';

export class TimingScreen extends EditorScreen {
  constructor() {
    super();
    this.padding = 10;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @resolved(ControlPointManager)
  controlPoints!: ControlPointManager;

  @dependencyLoader()
  load() {
    this.dependencies.provide(this.selection = new ControlPointSelection(this.controlPoints));

    this.addAllInternal(
      new RoundedBox({
        relativeSizeAxes: Axes.Both,
        color: this.colors.translucent,
        cornerRadius: 4,
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        width: 0.75,
        padding: { vertical: 5 },
        children: [
          new TimingPointTable(),
        ],
      }),
    );
  }

  selection!: ControlPointSelection;

  show() {
    this.y = 300;
    this.moveTo({ y: 0, duration: 400, easing: 'expo.out' });
    this.fadeIn({ duration: 400 });
  }
}
