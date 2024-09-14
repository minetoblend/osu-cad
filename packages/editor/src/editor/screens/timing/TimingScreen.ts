import {
  Axes,
  Box,
  Container,
  dependencyLoader,
  Direction,
  EasingFunction,
  MaskingContainer,
  resolved,
} from 'osucad-framework';
import { EditorScreen } from '../EditorScreen';
import { ThemeColors } from '../../ThemeColors';
import { ControlPointInfo } from '../../../beatmap/timing/ControlPointInfo';
import { ControlPointSelection } from './ControlPointSelection';
import { TimingPointTable } from './TimingPointTable.ts';
import { MetronomePlayer } from './MetronomePlayer.ts';
import { TimingPointRow } from './TimingPointRow.ts';
import { MainScrollContainer } from '../../MainScrollContainer.ts';
import { TimingPointProperties } from './properties/TimingPointProperties.ts';

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

    this.addInternal(new MetronomePlayer())

    this.addAllInternal(
      new MaskingContainer({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 4,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: this.colors.translucent,
          }),
          new Container({
            relativeSizeAxes: Axes.Both,
            child: new TimingPointTable().with({
              relativeSizeAxes: Axes.Y,
              width: TimingPointRow.MIN_WIDTH,
            }),
          }),
          new Container({
            relativeSizeAxes: Axes.Both,
            padding: { left: TimingPointRow.MIN_WIDTH },
            child: new MainScrollContainer(Direction.Vertical).with({
              relativeSizeAxes: Axes.Both,
              child: new TimingPointProperties()
            })
          }),
        ],
      }),
    );
  }

  selection!: ControlPointSelection;

  show() {
    this.moveToY(300).moveToY(0, 300, EasingFunction.OutExpo);
    this.fadeInFromZero(300);
  }

  hide() {
    this.moveToY(300, 400, EasingFunction.OutExpo);
    this.fadeOut(300);
  }
}
