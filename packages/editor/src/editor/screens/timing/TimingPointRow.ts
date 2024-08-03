import type {
  ClickEvent,
  Drawable,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  Box,
  Container,
  FillDirection,
  FillFlowContainer,
  LoadState,
  RoundedBox,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import type { ControlPoint } from '@osucad/common';
import { OsucadSpriteText } from '../../../OsucadSpriteText';
import { TimestampFormatter } from '../../TimestampFormatter';
import { ThemeColors } from '../../ThemeColors';
import { ControlPointSelection } from './ControlPointSelection';
import { SampleTypeBadge } from './SampleTypeBadge';
import { TimingPointValueBadge } from './TimingPointVaLueBadge';

export class TimingPointRow extends Container {
  constructor(
    readonly controlPoint: ControlPoint,
  ) {
    super({
      relativeSizeAxes: Axes.X,
      height: 25,
    });
  }

  #timestamp!: OsucadSpriteText;

  #timestampContainer!: Container;

  #selectionHighlight!: Box;

  #hoverHighlight!: Box;

  #timingDisplay?: Drawable;

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      this.#selectionHighlight = new Box({
        color: this.colors.primary,
        relativeSizeAxes: Axes.Both,
        alpha: this.selected ? 1 : 0,
      }),
      this.#hoverHighlight = new Box({
        alpha: 0,
        relativeSizeAxes: Axes.Both,
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { horizontal: 15 },
        children: [
          this.#timestampContainer = new Container({
            autoSizeAxes: Axes.Y,
            width: 160,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
            children: [
              this.#timestamp = new OsucadSpriteText({
                text: TimestampFormatter.formatTimestamp(this.controlPoint.time),
                anchor: Anchor.CenterLeft,
                origin: Anchor.CenterLeft,
                fontSize: 14,
              }),
            ],
          }),
          new SampleTypeBadge(this.controlPoint).apply({
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
            x: 180,
          }),
          this.#detailsContainer = new FillFlowContainer({
            direction: FillDirection.Horizontal,
            autoSizeAxes: Axes.Both,
            spacing: { x: 10, y: 0 },
            x: 300,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
        ],
      }),
    );

    this.controlPoint.onUpdate.addListener(() => {
      this.setup();
    });

    this.setup();
  }

  setup() {
    if (this.loadState < LoadState.Loading)
      return;

    this.#selectionHighlight.alpha = this.selected ? 1 : 0;

    this.#timestamp.text = TimestampFormatter.formatTimestamp(this.controlPoint.time);

    if (this.#timingDisplay) {
      this.#timestampContainer.remove(this.#timingDisplay);
      this.#timingDisplay = undefined;
    }

    if (this.controlPoint.timing) {
      const bpm = 60_000 / this.controlPoint.timing.beatLength;

      this.#timestampContainer.add(new Container({
        autoSizeAxes: Axes.Both,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        x: 80,
        children: [
          new RoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 4,
            color: 0x343440,
          }),
          new Container({
            autoSizeAxes: Axes.Both,
            padding: { horizontal: 4, vertical: 1 },
            child: new OsucadSpriteText({
              text: `${bpm.toFixed(2)} bpm`,
              fontSize: 11,
              fontWeight: 700,
            }),
            color: this.colors.primary,
          }),
        ],
      }));
    }

    this.#detailsContainer.clear();

    this.#detailsContainer.add(
      new TimingPointValueBadge('Volume', Math.round(this.controlPoint.volume).toString(), 0x81F542),
    );

    if (this.controlPoint.velocityMultiplier !== null) {
      this.#detailsContainer.add(
        new TimingPointValueBadge('SV', this.controlPoint.velocityMultiplier.toFixed(2), 0x944DFF),
      );
    }
  }

  onHover(): boolean {
    this.#hoverHighlight.alpha = 0.1;
    return true;
  }

  onHoverLost(): boolean {
    this.#hoverHighlight.alpha = 0;
    return true;
  }

  #selected = false;

  get selected() {
    return this.#selected;
  }

  set selected(value: boolean) {
    if (value === this.#selected)
      return;

    this.#selected = value;

    this.setup();
  }

  @resolved(ControlPointSelection)
  selection!: ControlPointSelection;

  onClick(e: ClickEvent): boolean {
    if (e.shiftPressed) {
      this.selection.selectUntil(this.controlPoint);
    }
    else if (e.controlPressed) {
      if (this.selected) {
        this.selection.deselect(this.controlPoint);
      }
      else {
        this.selection.select(this.controlPoint);
      }
    }
    else {
      this.selection.clear();
      this.selection.select(this.controlPoint);
    }

    return true;
  }

  #detailsContainer!: FillFlowContainer;
}
