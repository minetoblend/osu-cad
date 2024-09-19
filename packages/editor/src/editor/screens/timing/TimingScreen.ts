import type { DependencyContainer } from 'osucad-framework';
import { Axes, Box, Container, dependencyLoader, Direction, EasingFunction, MaskingContainer, resolved } from 'osucad-framework';
import { ControlPointInfo } from '../../../beatmap/timing/ControlPointInfo';
import { MainScrollContainer } from '../../MainScrollContainer.ts';
import { ThemeColors } from '../../ThemeColors';
import { EditorScreen } from '../EditorScreen';
import { ControlPointSelection } from './ControlPointSelection';
import { MetronomePlayer } from './MetronomePlayer.ts';
import { ControlPointProperties } from './properties/ControlPointProperties.ts';
import { TimingPointRow } from './TimingPointRow.ts';
import { TimingPointTable } from './TimingPointTable.ts';
import { TimingScreenTimeline } from './TimingScreenTimeline.ts';

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
  load(dependencies: DependencyContainer) {
    dependencies.provide(this.selection = new ControlPointSelection(this.controlPoints));

    this.addInternal(new MetronomePlayer());

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
            children: [
              new Container({
                relativeSizeAxes: Axes.Both,
                child: new TimingPointTable().with({
                  relativeSizeAxes: Axes.Y,
                  width: TimingPointRow.MIN_WIDTH + 200,
                }),
              }),
              new Container({
                relativeSizeAxes: Axes.Both,
                padding: { left: TimingPointRow.MIN_WIDTH + 200 },
                child: new MainScrollContainer(Direction.Vertical).with({
                  relativeSizeAxes: Axes.Both,
                  child: new ControlPointProperties(),
                }),
              }),
            ],
            padding: { top: 45 },
          }),
          new Container({
            relativeSizeAxes: Axes.X,
            height: 45,

            children: [
              new Box({
                relativeSizeAxes: Axes.Both,
                color: 0x101014,
                alpha: 1,
              }),
              new TimingScreenTimeline(),
            ],
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
