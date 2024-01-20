import {Component} from "../Component.ts";
import {Assets, Container, Point, Sprite, StencilMask, Texture} from "pixi.js";
import {Inject} from "../di";
import {EditorInstance} from "../../editorClient.ts";
import {HitObject, TickType} from "@osucad/common";
import {TimelineObject} from "./TimelineObject.ts";
import {TimelineZoom} from "../../TimelineZoom.ts";
import {BeatInfo} from "../../beatInfo.ts";

export interface TimelineVisibility {
  currentTime: number;
  width: number;
  startTime: number;
  endTime: number;
}

export class ObjectTimeline extends Component {

  private readonly background = new Sprite({
    texture: Texture.WHITE,
    alpha: 0.05,
  });
  private readonly eventReceiver = this;// new Container();
  private readonly tickContainer = new Container();
  private readonly timingPointContainer = new Container();
  private readonly hitObjectContainer = new Container();
  private readonly hitObjectMap = new Map<HitObject, TimelineObject>();
  private readonly currentTimeMarker = new Sprite({
    texture: Assets.get("timeline-tick"),
    anchor: new Point(0.5, 0.5),
    scale: new Point(0.55, 0.55),
    tint: 0x63E2B7,
  });


  @Inject(EditorInstance)
  private readonly editor!: EditorInstance;

  @Inject(BeatInfo)
  private readonly beatInfo!: BeatInfo;

  private readonly maskSprite = new Sprite(Texture.WHITE);

  private readonly selectBox = new Sprite({
    texture: Texture.WHITE,
    alpha: 0.25,
  });

  private ontick?: () => void;

  constructor(private readonly zoom: TimelineZoom) {
    super();
    this.size.y = 85;
    this.addChild(
      this.background,
      //this.eventReceiver,
      this.selectBox,
      this.tickContainer,
      this.timingPointContainer,
      this.hitObjectContainer,
      this.currentTimeMarker,
      this.maskSprite,
    );
    this.currentTimeMarker.eventMode = "none";
    this.maskSprite.eventMode = "none";

    this.addEffect(new StencilMask({ mask: this.maskSprite }));
    // this.hitObjectContainer.filters = [new AlphaFilter({ alpha: 0.85 })];
    this.setupSelectBox();
    this.setupZoom();
    // this.hitObjectContainer.enableRenderGroup();
    // this.tickContainer.enableRenderGroup();
  }

  setupSelectBox() {
    this.selectBox.visible = false;
    this.eventMode = "static";
    this.on("pointerdown", (evt) => {

      if (evt.button === 0 && !evt.ctrlKey && !evt.shiftKey)
        this.editor.selection.clear();

      const selectStartTime = this.getTimeAtPosition(evt.getLocalPosition(this).x);
      this.selectBox.visible = true;
      this.selectBox.width = 0;

      let position = evt.getLocalPosition(this).x;

      this.eventReceiver.onglobalpointermove = (evt) => {
        position = evt.getLocalPosition(this).x;
      };

      this.ontick = () => {
        const time = this.getTimeAtPosition(position);

        const min = Math.min(time, selectStartTime);
        const max = Math.max(time, selectStartTime);

        this.selectBox.x = this.getPositionForTime(min);
        this.selectBox.width = Math.abs(this.getPositionForTime(max) - this.selectBox.x);

        const hitObjects = this.editor.beatmapManager.hitObjects.hitObjects.filter((obj) => obj.endTime >= min && obj.startTime <= max);
        this.editor.selection.selectAll(hitObjects);
      };

      addEventListener("pointerup", () => {
        this.eventReceiver.onglobalpointermove = null;
        this.ontick = undefined;
        this.selectBox.visible = false;
      });
    });

  }

  setupZoom() {
    this.on("wheel", (evt) => {
      if (evt.altKey) {
        evt.stopImmediatePropagation();

        if (evt.deltaY < 0) {
          this.zoom.zoomIn();
        } else {
          this.zoom.zoomOut();
        }
      }
    });
  }

  _onUpdate() {
    super._onUpdate();
    if (!this.maskSprite) return;
    this.background.width = this.size.x;
    this.background.height = this.size.y * 0.3333;
    this.background.y = this.size.y * 0.3333;
    this.maskSprite.x = 0;
    this.maskSprite.scale.x = this.size.x;
    this.maskSprite.scale.y = this.size.y;
    //this.eventReceiver.hitArea = new Rectangle(0, 0, this.size.x, this.size.y);
    this.selectBox.height = this.size.y;
    this.currentTimeMarker.position.set(
      this.size.x * 0.4,
      this.size.y * 0.5,
    );
  }

  private readonly tickPool: Tick[] = [];

  get startTime() {
    return this.editor.clock.currentTimeAnimated - this.zoom.visibleDuration * 0.4;
  }

  get endTime() {
    return this.editor.clock.currentTimeAnimated + this.zoom.visibleDuration * 0.6;
  }

  getPositionForTime(time: number) {
    return (time - this.startTime) / (this.endTime - this.startTime) * this.size.x;
  }

  getTimeAtPosition(position: number) {
    return this.startTime + position / this.size.x * (this.endTime - this.startTime);
  }

  get pixelsPerMs() {
    return this.size.x / (this.endTime - this.startTime);
  }

  onTick() {
    performance.mark("computeTicks-started");

    const controlPoints = this.editor.beatmapManager.controlPoints;

    if (!controlPoints) return;

    const startTime = this.startTime;
    const endTime = this.endTime;

    const ticks = controlPoints.getTicks(this.startTime, this.endTime, this.beatInfo.beatSnap);

    performance.mark("computeTicks-finished");

    performance.measure("computeTicks-duration", "computeTicks-started", "computeTicks-finished");

    const objectY = this.size.y * 0.5;

    for (let i = 0; i < ticks.length; i++) {
      let tick = this.tickContainer.children[i] as Tick | undefined;
      if (!tick) {
        tick = this.tickPool.pop() ?? new Tick();
        this.tickContainer.addChild(tick);
      }
      const x = this.getPositionForTime(ticks[i].time);
      tick.position.set(x, objectY);
      tick.type = ticks[i].type;
    }
    if (ticks.length < this.tickContainer.children.length)
      this.tickPool.push(...(this.tickContainer.removeChildren(ticks.length) as Tick[]));

    this.tickPool.splice(30).forEach(tick => tick.destroy());

    performance.mark("updateTicks-finished");
    performance.measure("updateTicks-duration", "computeTicks-finished", "updateTicks-finished");

    const hitObjectManager = this.editor.beatmapManager.hitObjects;
    if (!hitObjectManager) return;

    const hitObjects = hitObjectManager.hitObjects.filter(it => {
      return it.endTime >= startTime && it.startTime <= endTime;
    });

    const shouldDelete = new Set<HitObject>(this.hitObjectMap.keys());


    for (let i = 0; i < hitObjects.length; i++) {
      const hitObject = hitObjects[i];
      shouldDelete.delete(hitObject);
      let drawable = this.hitObjectMap.get(hitObject);

      if (!drawable) {
        drawable = new TimelineObject(this, hitObject);
        this.hitObjectContainer.addChild(drawable);
        this.hitObjectMap.set(hitObject, drawable);
      }

      drawable.y = objectY;
      drawable.zIndex = -i;
    }
    for (const hitObject of shouldDelete) {
      const timelineObject = this.hitObjectMap.get(hitObject);
      if (!timelineObject) continue;
      this.hitObjectContainer.removeChild(timelineObject);
      this.hitObjectMap.delete(hitObject);
      timelineObject.destroy({ children: true });
    }
    this.hitObjectContainer.sortChildren();


    this.ontick?.();
  }
}

class Tick extends Sprite {
  constructor() {
    super(
      {
        texture: Assets.get("timeline-tick"),
      },
    );
    this.anchor.set(0.5);
    this.scale.set(0.5);
  }

  private _type?: TickType;

  set type(type: TickType) {
    if (this._type === type) return;
    this._type = type;
    switch (type) {
      case TickType.Full:
        this.tint = 0xffffff;
        this.scale.set(0.3);
        break;
      case TickType.Half:
        this.tint = 0xff0000;
        this.scale.set(0.25);
        break;
      case TickType.Third:
        this.tint = 0xff00ff;
        this.scale.set(0.2);
        break;
      case TickType.Quarter:
        this.tint = 0x3687f7;
        this.scale.set(0.2);
        break;
      case TickType.Sixth:
        this.tint = 0xff77ff;
        this.scale.set(0.15);
        break;
      case TickType.Eighth:
        this.tint = 0xffff00;
        this.scale.set(0.15);
        break;
      case TickType.Twelfth:
      case TickType.Sixteenth:
        this.tint = 0x777777;
        this.scale.set(0.1);
        break;
    }
  }
}