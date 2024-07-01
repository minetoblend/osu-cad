import { Beatmap, HitObject, Slider } from '@osucad/common';
import {
  Anchor,
  Axes,
  Container,
  DragEvent,
  FillMode,
  MouseButton,
  MouseDownEvent,
  MouseUpEvent,
  RoundedBox,
  SpriteText,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { Timeline } from './Timeline';
import { EditorClock } from '../EditorClock';
import { UIFonts } from '../UIFonts';

export class TimelineObject extends Container {
  constructor(readonly hitObject: HitObject) {
    super({
      relativeSizeAxes: Axes.Y,
      height: 0.55,
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterLeft,
    });

    this.startCircle = new TimelineObjectStartCircle(hitObject);
  }

  readonly body = new RoundedBox({
    relativeSizeAxes: Axes.Both,
    color: 0xffffff,
    cornerRadius: 100,
    alpha: 0.9,
    outlines: [
      {
        color: 0xffffff,
        width: 2,
        alpha: 0.8,
      },
    ],
  });

  startCircle: TimelineObjectStartCircle;

  endCircle?: SliderEndCircle;

  @dependencyLoader()
  load() {
    this.add(this.body);
    if (this.hitObject instanceof Slider) {
      this.add((this.endCircle = new SliderEndCircle(this.hitObject)));
    }
    this.add(this.startCircle);
  }

  timeline?: Timeline;

  @resolved(Beatmap)
  beatmap!: Beatmap;

  update() {
    super.update();

    this.timeline ??= this.findClosestParentOfType(Timeline)!;
    if (!this.timeline) {
      throw new Error('RhythmTimelineObject must be a child of RhythmTimeline');
    }

    const comboColor =
      this.beatmap.colors[
        this.hitObject.comboIndex % this.beatmap.colors.length
      ];
    this.body.fillColor = comboColor;
    this.startCircle.comboColor = comboColor;
    if (this.endCircle) this.endCircle.comboColor = comboColor;

    this.startCircle.comboNumber = this.hitObject.indexInCombo;

    const radius = this.drawSize.y * 0.5;
    this.x = this.timeline.timeToPosition(this.hitObject.startTime) - radius;

    this.width =
      this.timeline.durationToSize(this.hitObject.duration) + radius * 2;
  }
}

class TimelineObjectStartCircle extends Container {
  constructor(readonly hitObject: HitObject) {
    super({
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterLeft,
      relativeSizeAxes: Axes.Both,
    });
    this.fillMode = FillMode.Fit;
  }

  @resolved(UIFonts)
  fonts!: UIFonts;

  @dependencyLoader()
  load() {
    this.add(this.circle);
    this.add(
      (this.comboNumberText = new SpriteText({
        text: '1',
        anchor: Anchor.Center,
        origin: Anchor.Center,
        font: this.fonts.nunitoSans,
        style: {
          fontSize: 15,
          fill: 'white',
        },
      })),
    );
    this.add(this.overlay);
  }

  readonly circle = new RoundedBox({
    relativeSizeAxes: Axes.Both,
    cornerRadius: 100,
    outlines: [
      {
        color: 0xeeeeee,
        width: 2,
      },
    ],
  });

  readonly overlay = new RoundedBox({
    relativeSizeAxes: Axes.Both,
    cornerRadius: 100,
    alpha: 0,
  });

  set comboColor(value: number) {
    this.circle.fillColor = value;
  }

  comboNumberText!: SpriteText;

  set comboNumber(value: number) {
    if (value.toString() !== this.comboNumberText.text) {
      this.comboNumberText.text = (value + 1).toString();
    }
  }

  onHover(): boolean {
    this.overlay.alpha = 0.2;
    return false;
  }

  onHoverLost(): boolean {
    this.overlay.alpha = 0;
    return false;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(Beatmap)
  beatmap!: Beatmap;

  onDragStart(event: MouseUpEvent): boolean {
    return event.button === MouseButton.Left;
  }

  onDrag(event: DragEvent): boolean {
    const parent = this.findClosestParentOfType(Timeline);
    if (!parent) {
      throw new Error('RhtythmTimelineStartCircle must be a child of Timeline');
    }
    const time = parent.positionToTime(
      parent.toLocalSpace(event.screenSpaceMousePosition).x,
    );

    console.log(this.beatmap);

    this.hitObject.startTime = this.beatmap.controlPoints.snap(
      time,
      this.editorClock.beatSnapDivisor.value,
    );

    return true;
  }
}

class SliderEndCircle extends Container {
  constructor(readonly hitObject: Slider) {
    super({
      anchor: Anchor.CenterRight,
      origin: Anchor.CenterRight,
      relativeSizeAxes: Axes.Both,
    });
    this.fillMode = FillMode.Fit;

    this.add(this.circle);
    this.add(this.overlay);
  }

  readonly circle = new RoundedBox({
    relativeSizeAxes: Axes.Both,
    cornerRadius: 100,
    fillAlpha: 1,
    outlines: [
      {
        color: 0xeeeeee,
        width: 2,
      },
    ],
  });

  overlay = new RoundedBox({
    relativeSizeAxes: Axes.Both,
    cornerRadius: 100,
    alpha: 0,
  });

  set comboColor(value: number) {
    this.circle.fillColor = value;
  }

  onDragStart(event: MouseDownEvent): boolean {
    this.updateState();
    return event.button === MouseButton.Left;
  }

  onHover(): boolean {
    this.updateState();
    return false;
  }

  onHoverLost(): boolean {
    this.updateState();
    return false;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(Beatmap)
  beatmap!: Beatmap;

  onDrag(event: DragEvent): boolean {
    const parent = this.findClosestParentOfType(Timeline);
    if (!parent) {
      throw new Error('SliderEndCircle must be a child of RhythmTimeline');
    }
    const time = parent.positionToTime(
      parent.toLocalSpace(event.screenSpaceMousePosition).x,
    );

    if (!event.shiftPressed) {
      const spans = Math.round(
        (time - this.hitObject.startTime) / this.hitObject.spanDuration,
      );

      this.hitObject.spans = Math.max(1, spans);
    } else {
      const endTime = this.beatmap.controlPoints.snap(
        time,
        this.editorClock.beatSnapDivisor.value,
      );
      const targetDuration = endTime - this.hitObject.startTime;

      this.hitObject.velocityOverride =
        ((this.hitObject.velocity / this.hitObject.baseVelocity) *
          this.hitObject.duration) /
        targetDuration;
    }
    return true;
  }

  updateState() {
    if (this.isHovered || this.isDragged) {
      this.overlay.alpha = 0.2;
    } else {
      this.overlay.alpha = 0;
    }
  }
}
