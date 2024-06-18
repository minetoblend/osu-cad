import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from '../../framework/drawable/ContainerDrawable';
import { resolved } from '@/framework/di/DependencyLoader.ts';
import {
  ControlPointManager,
  HitObject,
  HitObjectManager,
} from '@osucad/common';
import { EditorClock } from '@/editor/EditorClock.ts';
import { Container, Texture } from 'pixi.js';
import { Axes } from '@/framework/drawable/Axes.ts';
import { Anchor } from '@/framework/drawable/Anchor.ts';
import { TimelineTick } from '@/editor/topBar/TimelineTick.ts';
import { Box } from '@/framework/drawable/Box.ts';
import { UIWheelEvent } from '@/framework/input/events/UIWheelEvent.ts';
import gsap from 'gsap';
import { DrawableSprite } from '@/framework/drawable/DrawableSprite.ts';
import { RhythmTimelineObject } from '@/editor/topBar/RhythmTimelineObject.ts';

export class RhythmTimeline extends ContainerDrawable {
  constructor(options: ContainerDrawableOptions = {}) {
    super(options);

    this.addInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        height: 0.3,
        color: 0xffffff,
        alpha: 0.05,
        anchor: Anchor.Centre,
        origin: Anchor.Centre,
      }),
    );
    this.drawNode.addChild(this.tickContainer);
    this.addInternal(this.innerContainer);
    this.addInternal(
      new DrawableSprite({
        texture: Texture.WHITE,
        width: 3,
        height: 1,
        relativeSizeAxes: Axes.Y,
        anchor: Anchor.Centre,
        origin: Anchor.Centre,
        color: 0x32d2ac,
      }),
    );
  }

  innerContainer = new ContainerDrawable({
    relativeSizeAxes: Axes.Both,
  });

  @resolved(EditorClock)
  clock!: EditorClock;

  @resolved(ControlPointManager)
  controlPoints!: ControlPointManager;

  tickContainer = new Container<TimelineTick>({
    alpha: 0.75,
  });

  zoom = 1;

  get visibleDuration() {
    return this.zoom * 2000;
  }

  get startTime() {
    return this.clock.currentTimeAnimated - this.visibleDuration / 2;
  }

  get endTime() {
    return this.clock.currentTimeAnimated + this.visibleDuration / 2;
  }

  timeToPosition(time: number) {
    return (time - this.startTime) * this.pixelsPerMs;
  }

  positionToTime(time: number) {
    return time / this.pixelsPerMs + this.startTime;
  }

  durationToSize(duration: number) {
    return duration * this.pixelsPerMs;
  }

  get pixelsPerMs() {
    return this.drawSize.x / this.visibleDuration;
  }

  onTick() {
    this.updateTicks();
    this.updateObjects();
  }

  private updateTicks() {
    this.tickContainer.y = this.drawSize.y * 0.5;
    this.tickContainer.scale.set(1, this.drawSize.y);

    const ticks = this.controlPoints.getTicks(
      this.startTime,
      this.endTime,
      this.clock.beatSnapDivisor,
    );

    for (let i = this.tickContainer.children.length; i < ticks.length; i++) {
      this.tickContainer.addChild(new TimelineTick());
    }
    if (ticks.length < this.tickContainer.children.length) {
      this.tickContainer.removeChildren(
        ticks.length,
        this.tickContainer.children.length,
      );
    }

    for (let i = 0; i < ticks.length; i++) {
      const tick = this.tickContainer.children[i];
      const tickInfo = ticks[i];
      tick.x = this.timeToPosition(tickInfo.time);
      tick.type = tickInfo.type;
    }
  }

  @resolved(HitObjectManager)
  hitObjects!: HitObjectManager;

  hitObjectMap = new Map<HitObject, RhythmTimelineObject>();

  updateObjects() {
    const startTime = this.startTime - 1000;
    const endTime = this.endTime + 1000;
    const objects = this.hitObjects.hitObjects.filter(
      (it) => it.endTime >= startTime && it.startTime <= endTime,
    );

    const shouldRemove = new Set(this.hitObjectMap.keys());
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      let drawable = this.hitObjectMap.get(object);
      if (!drawable) {
        drawable = new RhythmTimelineObject(object);
        this.hitObjectMap.set(object, drawable);
        this.innerContainer.add(drawable);
      }
      drawable.updateContent();
      drawable.zIndex = objects.length - i;
      shouldRemove.delete(object);
    }

    for (const object of shouldRemove) {
      const drawable = this.hitObjectMap.get(object);
      if (drawable) {
        this.innerContainer.remove(drawable);
        this.hitObjectMap.delete(object);
      }
    }
  }

  onWheel(event: UIWheelEvent): boolean {
    if (event.ctrl) {
      if (event.deltaY > 0) {
        this.zoomOut();
      } else {
        this.zoomIn();
      }
    }

    return false;
  }

  zoomSpeed = 0.3;

  zoomOut(factor: number = 1) {
    gsap.to(this, {
      zoom: Math.min(this.zoom * (1 + this.zoomSpeed * factor), 8),
      duration: 0.15,
      ease: 'power2.out',
    });
  }

  zoomIn(factor: number = 1) {
    gsap.to(this, {
      zoom: Math.max(this.zoom / (1 + this.zoomSpeed * factor), 0.25),
      duration: 0.15,
      ease: 'power2.out',
    });
  }
}
