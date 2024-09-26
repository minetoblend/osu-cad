import type { DependencyContainer, ScrollContainer } from 'osucad-framework';
import type { ControlPointGroup } from '../../../beatmap/timing/ControlPointGroup';
import { Axes, Bindable, Box, Container, dependencyLoader, Direction, DrawablePool, lerp, resolved } from 'osucad-framework';
import { ControlPointInfo } from '../../../beatmap/timing/ControlPointInfo';
import { EditorClock } from '../../EditorClock';
import { MainScrollContainer } from '../../MainScrollContainer';
import { KiaiBadge } from './KiaiBadge';
import { TimingPointRow } from './TimingPointRow';
import { TimingPointTableHeader } from './TimingPointTableHeader';
import { TimingScreenDependencies } from './TimingScreenDependencies.ts';

export class TimingPointTable extends Container {
  @resolved(ControlPointInfo)
  controlPoints!: ControlPointInfo;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.drawNode.enableRenderGroup();
  }

  #scroll!: ScrollContainer;

  readonly #pool = new DrawablePool(TimingPointRow, 25, 100);

  activeControlPoint = new Bindable<ControlPointGroup | null>(null);

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    const { activeControlPoint } = dependencies.resolve(TimingScreenDependencies);

    this.activeControlPoint.bindTo(activeControlPoint);

    this.addAllInternal(
      this.#pool,
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: {
          left:
            TimingPointRow.COLUMNS.startTime.width + TimingPointRow.COLUMNS.timing.width,
        },
        child: new Box({
          relativeSizeAxes: Axes.Both,
          color: 0x17171B,
        }),
      }),
      new Box({
        relativeSizeAxes: Axes.Y,
        width: 1,
        x: TimingPointRow.COLUMNS.sliderVelocity.x,
        color: 0x222228,
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: TimingPointRow.HEIGHT },
        child: this.#scroll = new MainScrollContainer(Direction.Vertical).with({
          relativeSizeAxes: Axes.Both,
          children: [
            this.#rowContainer = new Container({
              relativeSizeAxes: Axes.Both,
            }),
            this.#kiaiContainer = new Container({
              x: TimingPointRow.COLUMNS.effects.x,
            }),
          ],
        }),
      }),
      new TimingPointTableHeader(),
    );

    this.#scroll.scrollContent.autoSizeAxes = Axes.None;
  }

  #rows = new Map<ControlPointGroup, TimingPointRow>();

  #rowContainer = new Container();
  #kiaiContainer = new Container();

  update() {
    super.update();

    const bleed = 5;

    const startIndex = Math.max(Math.floor(this.#scroll.current / TimingPointRow.HEIGHT) - bleed, 0);
    const endIndex = startIndex + Math.ceil(this.#scroll.drawHeight / TimingPointRow.HEIGHT) + bleed * 2;

    const toDelete = new Set(this.#rows.keys());

    let y = startIndex * TimingPointRow.HEIGHT;

    let lastWasKiai = false;
    const kiaiIndex = 0;

    for (let i = startIndex; i < endIndex; i++) {
      const controlPoint = this.controlPoints.groups.get(i);
      if (!controlPoint)
        break;

      toDelete.delete(controlPoint);

      if (!this.#rows.has(controlPoint)) {
        const row = this.#pool.get((it) => {
          it.controlPoint = controlPoint;
          it.depth = controlPoint.time;
        });

        row.y = y;
        row.active = controlPoint === this.activeControlPoint.value;

        this.#rowContainer.add(row);
        this.#rows.set(controlPoint, row);
      }
      else {
        const row = this.#rows.get(controlPoint)!;

        row.y = lerp(y, row.y, Math.exp(-0.05 * this.time.elapsed));
        row.active = controlPoint === this.activeControlPoint.value;
      }

      if (!lastWasKiai && controlPoint.effect?.kiaiMode) {
        let numKiai = 1;
        for (let j = i + 1; j < endIndex; j++) {
          const controlPoint = this.controlPoints.groups.get(j);
          if (!controlPoint)
            break;

          if (controlPoint.effect?.kiaiMode !== false)
            numKiai++;
          else
            break;
        }

        const height = TimingPointRow.HEIGHT * numKiai;

        let drawable = this.#kiaiContainer.children[kiaiIndex];
        if (!drawable) {
          drawable = new KiaiBadge();
          this.#kiaiContainer.add(drawable);
        }

        drawable.y = y;
        drawable.height = height;
      }

      lastWasKiai = !!controlPoint.effect?.kiaiMode;

      y += TimingPointRow.HEIGHT;
    }

    this.#scroll.scrollContent.height = this.controlPoints.groups.length * TimingPointRow.HEIGHT;

    for (const c of toDelete) {
      const row = this.#rows.get(c)!;
      this.#rowContainer.remove(row, false);
      this.#rows.delete(c);
    }
  }

  protected loadComplete() {
    super.loadComplete();

    this.#scroll.scrollContent.height = this.controlPoints.groups.length * TimingPointRow.HEIGHT;

    this.schedule(() => this.scrollToActive(false));
  }

  scrollToActive(animated = true) {
    const activeGroup = this.controlPoints.groups.controlPointAt(this.editorClock.currentTime);

    if (activeGroup) {
      const index = this.controlPoints.groups.indexOf(activeGroup);

      this.#scroll.scrollTo(index * TimingPointRow.HEIGHT, animated);
    }
  }
}
