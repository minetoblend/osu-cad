import { Axes, Container, EasingFunction, RoundedBox, dependencyLoader, resolved } from 'osucad-framework';
import { EditorScreen } from '../EditorScreen';
import { ThemeColors } from '../../ThemeColors';
import { ControlPointInfo } from '../../../beatmap/timing/ControlPointInfo';
import { ControlPointSelection } from './ControlPointSelection';
import { TimingPointTable } from './TimingPointTable';

export class TimingScreen extends EditorScreen {
  constructor() {
    super();
    this.padding = 10;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @resolved(ControlPointInfo)
  controlPoints!: ControlPointInfo;

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
    this.moveToY(0, 400, EasingFunction.OutExpo);
    this.fadeIn(400);
  }
}
