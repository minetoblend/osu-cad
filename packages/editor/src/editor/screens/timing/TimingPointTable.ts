import {
  Axes,
  Box,
  Container,
  dependencyLoader,
  Direction,
  DrawablePool,
  lerp,
  resolved,
  ScrollContainer,
} from 'osucad-framework';

import { MainScrollContainer } from '../../MainScrollContainer';
import { EditorClock } from '../../EditorClock';
import { ControlPointInfo } from '../../../beatmap/timing/ControlPointInfo';
import type { ControlPointGroup } from '../../../beatmap/timing/ControlPointGroup';
import { TimingPointRow } from './TimingPointRow';
import { TimingPointTableHeader } from './TimingPointTableHeader.ts';

export class TimingPointTable extends Container {
  @resolved(ControlPointInfo)
  controlPoints!: ControlPointInfo;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  #scroll!: ScrollContainer;

  readonly #pool = new DrawablePool(TimingPointRow, 25, 100);

  @dependencyLoader()
  load() {
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
        }),
      }),
      new TimingPointTableHeader(),
    );

    // @ts-ignore
    this.#scroll.scrollContent.autoSizeAxes = Axes.None;
  }

  #rows = new Map<ControlPointGroup, TimingPointRow>();

  update() {
    super.update();

    const startIndex = Math.max(Math.floor(this.#scroll.current / TimingPointRow.HEIGHT), 0);
    const endIndex = startIndex + Math.ceil(this.#scroll.drawSize.y / TimingPointRow.HEIGHT) + 1;

    const toDelete = new Set(this.#rows.keys());

    let y = startIndex * TimingPointRow.HEIGHT;

    const activeGroup = this.controlPoints.groups.controlPointAt(this.editorClock.currentTime);

    for (let i = startIndex; i < endIndex; i++) {
      const controlPoint = this.controlPoints.groups.get(i);
      if (!controlPoint)
        break;

      toDelete.delete(controlPoint);

      if (!this.#rows.has(controlPoint)) {
        const row = this.#pool.get(it => {
          it.controlPoint = controlPoint;
          it.depth = controlPoint.time;
        });

        row.y = y;
        row.active = controlPoint === activeGroup;

        this.#scroll.add(row);
        this.#rows.set(controlPoint, row);


      } else {
        const row = this.#rows.get(controlPoint)!;

        row.y = lerp(y, row.y, Math.exp(-0.05 * this.time.elapsed));
        row.active = controlPoint === activeGroup;
      }

      y += TimingPointRow.HEIGHT;
    }

    this.#scroll.scrollContent.height = this.controlPoints.groups.length * TimingPointRow.HEIGHT;

    for (const c of toDelete) {
      const row = this.#rows.get(c)!;
      this.#scroll.remove(row, false);
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
      let index = this.controlPoints.groups.indexOf(activeGroup);

      this.#scroll.scrollTo(index * TimingPointRow.HEIGHT, animated);
    }
  }
}
