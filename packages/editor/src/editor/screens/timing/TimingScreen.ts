import type {
  DependencyContainer,
} from 'osucad-framework';
import type { EditorBackground } from '../../EditorBackground.ts';
import {
  Anchor,
  Axes,
  Bindable,
  Box,
  Container,
  dependencyLoader,
  Direction,
  EasingFunction,
  MaskingContainer,
  resolved,
} from 'osucad-framework';
import { ControlPointGroup } from '../../../beatmap/timing/ControlPointGroup.ts';
import { ControlPointInfo } from '../../../beatmap/timing/ControlPointInfo';
import { OsucadButton } from '../../../userInterface/OsucadButton.ts';
import { EditorClock } from '../../EditorClock.ts';
import { MainScrollContainer } from '../../MainScrollContainer';
import { ThemeColors } from '../../ThemeColors';
import { EditorScreen } from '../EditorScreen';
import { MetronomePlayer } from './MetronomePlayer';
import { ControlPointProperties } from './properties/ControlPointProperties';
import { TimingPointRow } from './TimingPointRow';
import { TimingPointTable } from './TimingPointTable';
import { TimingScreenDependencies } from './TimingScreenDependencies.ts';
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

  activeControlPoint = new Bindable<ControlPointGroup | null>(null);

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    dependencies.provide(new TimingScreenDependencies(
      this.activeControlPoint,
    ));

    this.addInternal(new MetronomePlayer());

    this.addAllInternal(
      new MaskingContainer({
        relativeSizeAxes: Axes.Both,
        width: 0.8,
        anchor: Anchor.TopCenter,
        origin: Anchor.TopCenter,
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
                children: [
                  new TimingPointTable().with({
                    relativeSizeAxes: Axes.Y,
                    width: TimingPointRow.MIN_WIDTH + 100,
                  }),
                  new Container({
                    relativeSizeAxes: Axes.Both,
                    padding: 8,
                    child: new OsucadButton({
                      anchor: Anchor.BottomLeft,
                      origin: Anchor.BottomLeft,
                    })
                      .primary()
                      .withText('Add at current time')
                      .withAction(() => {
                        const group = new ControlPointGroup();
                        group.time = this.editorClock.targetTime;
                        this.controlPoints.add(group);

                        this.activeControlPoint.value = group;
                      }),
                  }),
                ],
              }),
              new Container({
                relativeSizeAxes: Axes.Both,
                padding: { left: TimingPointRow.MIN_WIDTH + 100 },
                child: new MainScrollContainer(Direction.Vertical).with({
                  relativeSizeAxes: Axes.Both,
                  child: this.#controlPointProperties = new ControlPointProperties(),
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

    this.activeControlPoint.value = this.controlPoints.groups.controlPointAt(this.editorClock.targetTime) ?? null;

    this.#controlPointProperties.current = this.activeControlPoint;
  }

  #controlPointProperties!: ControlPointProperties;

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

  @resolved(EditorClock)
  editorClock!: EditorClock;
}
