import type { IKeyBindingHandler, KeyBindingPressEvent, KeyDownEvent, ScrollContainer } from 'osucad-framework';
import { Axes, Container, Direction, Key, PlatformAction, clamp, dependencyLoader, resolved } from 'osucad-framework';

import { MainScrollContainer } from '../../MainScrollContainer';
import { EditorClock } from '../../EditorClock';
import { ControlPointInfo } from '../../../beatmap/timing/ControlPointInfo';
import type { ControlPointGroup } from '../../../beatmap/timing/ControlPointGroup';
import { TimingPointRow } from './TimingPointRow';
import { ControlPointSelection } from './ControlPointSelection';

export class TimingPointTable extends Container implements IKeyBindingHandler<PlatformAction> {
  @resolved(ControlPointInfo)
  controlPoints!: ControlPointInfo;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: PlatformAction): boolean {
    return binding instanceof PlatformAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction>): boolean {
    switch (e.pressed) {
      case PlatformAction.SelectAll:
        this.selectAll();
        return true;
      case PlatformAction.Cut:
        this.cut();
        return true;
      case PlatformAction.Copy:
        this.copy();
        return true;
      case PlatformAction.Paste:
        this.paste();
        return true;
    }

    return false;
  }

  @dependencyLoader()
  load() {
    this.addInternal(this.#scroll = new MainScrollContainer(Direction.Vertical));

    // eslint-disable-next-line dot-notation
    this.#scroll.scrollContent['autoSizeAxes'] = Axes.None;
    this.#scroll.relativeSizeAxes = Axes.Both;
    this.#scroll.distanceDecayJump = 0.025;

    // this.selection.selectionChanged.addListener(([object, selected]) => {
    //   const row = this.#visibleRows.get(object);
    //   if (row) {
    //     row.selected = selected;
    //   }
    // });
  }

  #scroll!: ScrollContainer;

  #visibleRows = new Map<ControlPointGroup, TimingPointRow>();

  update() {
    super.update();

    const rowHeight = 25;

    this.#scroll.scrollContent.height = this.controlPoints.groups.length * rowHeight + 100;

    const scrollStart = this.#scroll.current;
    const scrollEnd = scrollStart + this.#scroll.drawSize.y;

    const startIndex = Math.max(Math.floor(scrollStart / rowHeight) - 10, 0);
    const endIndex = Math.min(Math.ceil(scrollEnd / rowHeight) + 10, this.controlPoints.groups.length - 1);

    const toDelete = new Set(this.#visibleRows.keys());

    for (let i = startIndex; i <= endIndex; i++) {
      const controlPoint = this.controlPoints.groups.get(i);

      if (!controlPoint)
        continue;

      if (toDelete.has(controlPoint)) {
        toDelete.delete(controlPoint);

        this.#visibleRows.get(controlPoint)!.y = i * rowHeight;

        continue;
      }

      const row = new TimingPointRow(controlPoint);

      // row.selected = this.selection.isSelected(controlPoint);

      row.y = i * rowHeight;

      this.#scroll.add(row);

      this.#visibleRows.set(controlPoint, row);
    }

    for (const c of toDelete) {
      const drawable = this.#visibleRows.get(c)!;

      this.#scroll.remove(drawable);
      this.#visibleRows.delete(c);
    }
  }

  @resolved(ControlPointSelection)
  selection!: ControlPointSelection;

  onKeyDown(e: KeyDownEvent): boolean {
    switch (e.key) {
      case Key.ArrowUp:
        this.moveSelection(-1, e.shiftPressed);
        return true;
      case Key.ArrowDown:
        this.moveSelection(1, e.shiftPressed);
        return true;
      case Key.PageUp:
        this.moveSelection(-10, e.shiftPressed);
        return true;
      case Key.PageDown:
        this.moveSelection(10, e.shiftPressed);
        return true;
      case Key.Home:
        if (this.controlPoints.groups.length === 0)
          return true;

        this.selection.clear();
        // this.selection.select(this.controlPoints.controlPoints[0]);
        this.scrollIntoView(0);
        return true;
      case Key.End:
        if (this.controlPoints.groups.length === 0)
          return true;

        this.selection.clear();
        // this.selection.select(this.controlPoints.controlPoints[this.controlPoints.controlPoints.length - 1]);
        this.scrollIntoView(this.controlPoints.groups.length - 1);
        return true;
      case Key.Enter:
        if (this.selection.selection.size === 1) {
          this.editorClock.seek([...this.selection.selection][0].time);
        }
    }

    return false;
  }

  moveSelection(offset: number, addToSelection: boolean = false) {
    let index = Math.floor(this.#scroll.current / 25);

    if (this.selection.selection.size > 0) {
      // const controlPoint = [...this.selection.selection].pop()!;

      // index = this.controlPoints.controlPoints.indexOf(controlPoint);

      if (index === -1)
        return;
    }

    index += offset;

    index = clamp(index, 0, this.controlPoints.groups.length - 1);

    if (addToSelection) {
      for (let i = 0; i <= Math.abs(offset); i++) {
        // const c = this.controlPoints.controlPoints[index - offset + i * Math.sign(offset)];
        // if (!c)
        //   continue;

        // this.selection.select(c);
      }
    }
    else {
      this.selection.clear();
      // this.selection.select(this.controlPoints.controlPoints[index]);
    }

    this.scrollIntoView(index);
  }

  scrollIntoView(index: number) {
    const scrollTarget = 25 * index;

    if (scrollTarget - 25 < this.#scroll.current) {
      this.#scroll.scrollTo(Math.max(scrollTarget - 25, 0));
    }
    else if (scrollTarget + 50 > this.#scroll.current + this.#scroll.drawSize.y) {
      this.#scroll.scrollTo(scrollTarget - this.#scroll.drawSize.y + 50);
    }
  }

  selectAll() {

  }

  cut() {

  }

  copy() {}

  paste() {}
}
