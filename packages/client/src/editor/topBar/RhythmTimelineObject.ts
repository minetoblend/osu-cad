import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable.ts';
import { Axes } from '@/framework/drawable/Axes.ts';
import { Beatmap, HitObject, Slider, Vec2 } from '@osucad/common';
import { RoundedBox } from '@/framework/drawable/RoundedBox.ts';
import { Invalidation } from '@/framework/drawable/Invalidation.ts';
import { RhythmTimeline } from '@/editor/topBar/RhythmTimeline.ts';
import { dependencyLoader, resolved } from '@/framework/di/DependencyLoader.ts';
import { Anchor } from '@/framework/drawable/Anchor.ts';
import { DrawableText } from '@/framework/drawable/SpriteText.ts';
import {
  MouseDownEvent,
  MouseMoveEvent,
} from '../../framework/input/events/MouseEvent.ts';
import { EditorClock } from '../EditorClock.ts';

export class RhythmTimelineObject extends ContainerDrawable {
  constructor(readonly hitObject: HitObject) {
    super({
      relativeSizeAxes: Axes.Y,
      height: 0.55,
      anchor: Anchor.CentreLeft,
      origin: Anchor.CentreLeft,
    });

    this.startCircle = new RhtythmTimelineStartCircle(hitObject);
  }

  readonly body = new RoundedBox({
    relativeSizeAxes: Axes.Both,
    color: 0xffffff,
    cornerRadius: 100,
    alpha: 0.9,
    outlines: [
      {
        // color: 0xbbbbbb,
        color: 0xffffff,
        width: 2,
        alpha: 0.8,
      },
    ],
  });

  override handleInvalidations() {
    super.handleInvalidations();
    if (this._invalidations & Invalidation.DrawSize) {
      this.startCircle.size = new Vec2(this.drawSize.y);
      if (this.endCircle) this.endCircle.size = new Vec2(this.drawSize.y);
    }
  }

  startCircle: RhtythmTimelineStartCircle;

  endCircle?: SliderEndCircle;

  @dependencyLoader()
  load() {
    this.timeline = this.findParentOfType(RhythmTimeline)!;
    if (!this.timeline) {
      throw new Error('RhythmTimelineObject must be a child of RhythmTimeline');
    }
    this.add(this.body);
    if (this.hitObject instanceof Slider) {
      this.endCircle = new SliderEndCircle(this.hitObject);
      this.add(this.endCircle);
    }
    this.add(this.startCircle);
  }

  timeline!: RhythmTimeline;

  @resolved(Beatmap)
  beatmap!: Beatmap;

  updateContent() {
    const comboColor =
      this.beatmap.colors[
        this.hitObject.comboIndex % this.beatmap.colors.length
      ];
    this.body.color = comboColor;
    this.startCircle.color = comboColor;
    if (this.endCircle) this.endCircle.color = comboColor;

    this.startCircle.comboNumber = this.hitObject.comboIndex;

    const radius = this.drawSize.y * 0.5;
    this.x = this.timeline.timeToPosition(this.hitObject.startTime) - radius;

    this.width =
      this.timeline.durationToSize(this.hitObject.duration) + radius * 2;
  }
}

class RhtythmTimelineStartCircle extends ContainerDrawable {
  constructor(readonly hitObject: HitObject) {
    super({
      anchor: Anchor.CentreLeft,
      origin: Anchor.CentreLeft,
    });

    this.add(this.circle);
    this.add(this.comboNumberText);
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

  set color(value: number) {
    this.circle.color = value;
  }

  comboNumberText = new DrawableText({
    text: '1',
    anchor: Anchor.Centre,
    origin: Anchor.Centre,
    fontSize: 15,
  });

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

  dragging = false;

  onMouseDown(event: MouseDownEvent): boolean {
    if (event.left) {
      this.dragging = true;
      event.capture();
      return true;
    }
    return false;
  }

  onMouseUp(): boolean {
    this.dragging = false;
    return true;
  }

  @resolved(EditorClock)
  clock!: EditorClock;

  onMouseMove(event: MouseMoveEvent): boolean {
    if (this.dragging) {
      const parent = this.findParentOfType(RhythmTimeline);
      if (!parent) {
        throw new Error(
          'RhtythmTimelineStartCircle must be a child of RhythmTimeline',
        );
      }
      const time = parent.positionToTime(
        parent.toLocalSpace(event.screenSpacePosition).x,
      );

      this.hitObject.startTime = this.clock.snap(time);
    }
    return true;
  }
}

class SliderEndCircle extends ContainerDrawable {
  constructor(readonly hitObject: Slider) {
    super({
      anchor: Anchor.CentreRight,
      origin: Anchor.CentreRight,
    });

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

  set color(value: number) {
    this.circle.color = value;
  }

  dragging = false;

  onMouseDown(event: MouseDownEvent): boolean {
    if (event.left) {
      this.dragging = true;
      this.updateState();
      event.capture();
      return true;
    }
    return false;
  }

  onMouseUp(): boolean {
    this.dragging = false;
    this.updateState();
    return true;
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
  clock!: EditorClock;

  onMouseMove(event: MouseMoveEvent) {
    if (this.dragging) {
      const parent = this.findParentOfType(RhythmTimeline);
      if (!parent) {
        throw new Error('SliderEndCircle must be a child of RhythmTimeline');
      }
      const time = parent.positionToTime(
        parent.toLocalSpace(event.screenSpacePosition).x,
      );

      if (!event.shift) {
        const spans = Math.round(
          (time - this.hitObject.startTime) / this.hitObject.spanDuration,
        );

        this.hitObject.spans = Math.max(1, spans);
      } else {
        const endTime = this.clock.snap(time);
        const targetDuration = endTime - this.hitObject.startTime;

        this.hitObject.velocityOverride =
          ((this.hitObject.velocity / this.hitObject.baseVelocity) *
            this.hitObject.duration) /
          targetDuration;
      }
      return true;
    }
    return false;
  }

  updateState() {
    if (this.hovered || this.dragging) {
      this.overlay.alpha = 0.2;
    } else {
      this.overlay.alpha = 0;
    }
  }
}
