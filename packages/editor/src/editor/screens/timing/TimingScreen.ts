import type {
  DependencyContainer,
  ScreenExitEvent,
  ScreenTransitionEvent,
} from 'osucad-framework';
import type { BackgroundAdjustment } from '../BackgroundAdjustment.ts';
import { Anchor, Axes, Bindable, Box, Container, dependencyLoader, Direction, EasingFunction, MaskingContainer, resolved } from 'osucad-framework';
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

    this.relativePositionAxes = Axes.Y;
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
        width: 0.9,
        anchor: Anchor.TopCenter,
        origin: Anchor.TopCenter,
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
                    width: TimingPointRow.MIN_WIDTH + 200,
                  }),
                  new Container({
                    relativeSizeAxes: Axes.Both,
                    padding: 8,
                    child: new OsucadButton({
                      anchor: Anchor.BottomLeft,
                      origin: Anchor.BottomLeft,
                      y: -48,
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
                padding: { left: TimingPointRow.MIN_WIDTH + 200 },
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

  onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.fadeInFromZero(500, EasingFunction.OutQuad);

    this.moveToY(1).moveToY(0, 400, EasingFunction.OutExpo);
  }

  onExiting(e: ScreenExitEvent): boolean {
    if (super.onExiting(e))
      return true;

    this.moveToY(1, 500, EasingFunction.OutExpo);

    return false;
  }

  protected override adjustBackground(background: BackgroundAdjustment) {
    background.size = 1.35;
    background.alpha = 0.35;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  protected get bottomTimelinePadding(): boolean {
    return false;
  }
}
