import type { DependencyContainer } from 'osucad-framework';
import type { EditorBackground } from '../../EditorBackground.ts';
import { Axes, Box, Container, dependencyLoader, Direction, EasingFunction, MaskingContainer, resolved } from 'osucad-framework';
import { ControlPointInfo } from '../../../beatmap/timing/ControlPointInfo';
import { MainScrollContainer } from '../../MainScrollContainer';
import { ThemeColors } from '../../ThemeColors';
import { EditorScreen } from '../EditorScreen';
import { ControlPointSelection } from './ControlPointSelection';
import { MetronomePlayer } from './MetronomePlayer';
import { ControlPointProperties } from './properties/ControlPointProperties';
import { TimingPointRow } from './TimingPointRow';
import { TimingPointTable } from './TimingPointTable';
import { TimingScreenTimeline } from './TimingScreenTimeline';

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
    super.show();

    this.moveToY(300).moveToY(0, 300, EasingFunction.OutExpo);
  }

  hide() {
    this.moveToY(300, 400, EasingFunction.OutExpo);
    this.fadeOut(300);
  }

  adjustBackground(background: EditorBackground) {
    background.scaleTo(1.35, 500, EasingFunction.OutExpo)
      .fadeTo(0.35, 500, EasingFunction.OutQuad);
  }
}
