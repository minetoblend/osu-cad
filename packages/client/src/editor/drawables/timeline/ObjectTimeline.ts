import {Component} from "../Component.ts";
import {AlphaFilter, Assets, Container, Point, Rectangle, Sprite, StencilMask, Texture} from "pixi.js";
import {Inject, Provide} from "../di";
import {HitObject, TickType} from "@osucad/common";
import {TimelineObject} from "./TimelineObject.ts";
import {TimelineZoom} from "../../TimelineZoom.ts";
import {BeatInfo} from "../../beatInfo.ts";
import {EditorContext} from "@/editor/editorContext.ts";
import {TimelinePositionManager} from "@/editor/drawables/timeline/timelinePositionManager.ts";
import {ControlPointTimeline} from "@/editor/drawables/timeline/ControlPointTimeline.ts";

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
  private readonly controlPointTimeline = new ControlPointTimeline()
  private readonly hitObjectContainer = new Container();
  private readonly hitObjectMap = new Map<HitObject, TimelineObject>();
  private readonly currentTimeMarker = new Sprite({
    texture: Assets.get("timeline-tick"),
    anchor: new Point(0.5, 0.5),
    scale: new Point(0.55, 0.55),
    tint: 0x63E2B7,
  });

  @Inject(EditorContext)
  private readonly editor!: EditorContext;

  @Inject(BeatInfo)
  private readonly beatInfo!: BeatInfo;

  private readonly maskSprite = new Sprite(Texture.WHITE);

  private readonly selectBox = new Sprite({
    texture: Texture.WHITE,
    alpha: 0.25,
  });

  private ontick?: () => void;

  @Provide(TimelinePositionManager)
  readonly positionManager: TimelinePositionManager

  constructor(private readonly zoom: TimelineZoom) {
    super();
    this.positionManager = new TimelinePositionManager(zoom)

    this.addChild(
      this.positionManager,
      this.background,
      this.selectBox,
      this.tickContainer,
      this.hitObjectContainer,
      this.currentTimeMarker,
      this.maskSprite,
      this.controlPointTimeline,
    );
    this.currentTimeMarker.eventMode = "none";
    this.maskSprite.eventMode = "none";
    this.tickContainer.eventMode = "none";

    this.addEffect(new StencilMask({mask: this.maskSprite}));
    this.hitObjectContainer.filters = [
      new AlphaFilter({alpha: 0.85, resolution: window.devicePixelRatio})
    ];
    this.setupSelectBox();
    this.setupZoom();
  }

  setupSelectBox() {
    this.selectBox.visible = false;
    this.eventMode = "static";

    const canvas = document.querySelector('canvas')! as HTMLCanvasElement;

    let touching = false;

    useEventListener(canvas, 'touchstart', (evt) => {
      if (evt.targetTouches.length !== 2) return;
      if (!touching) return

      this.eventMode = 'none'
      this.onglobalpointermove = null
      this.ontick = undefined

      if (this.editor.commandManager.commit()) {
        this.editor.commandManager.undo()
      }

      let p1: number | undefined = undefined;

      let p2: number | undefined = undefined;


      const onMove = (evt: TouchEvent) => {
        evt.stopImmediatePropagation()
        evt.preventDefault()

        const touches = evt.targetTouches;
        if (touches.length !== 2) return;

        const t1 = this.toLocal({
          x: touches[0].clientX - canvas.clientLeft,
          y: touches[0].clientY - canvas.clientTop,
        }).x

        const t2 = this.toLocal({
          x: touches[1].clientX - canvas.clientLeft,
          y: touches[1].clientY - canvas.clientTop,
        }).x

        if (p1 === undefined || p2 === undefined) {
          p1 = t1;
          p2 = t2;
          return;
        }

        const scaleChange = (t1 - t2) / (p1 - p2);
        const offsetChange = (t1 + t2) / 2 - (p1 + p2) / 2;

        const deltaMs = offsetChange / this.positionManager.pixelsPerMillisecond;

        p1 = t1;
        p2 = t2;

        this.zoom.setZoom(this.zoom.zoom * scaleChange);
        this.editor.clock.seek(this.editor.clock.currentTime - deltaMs, false);
      }

      canvas.addEventListener('touchmove', onMove, {passive: false})

      canvas.addEventListener('touchend', () => {
        canvas.removeEventListener('touchmove', onMove)
        this.eventMode = 'static'
        this.editor.clock.seek(this.beatInfo.snap(this.editor.clock.currentTime))
      }, {once: true})
    })

    this.on("pointerdown", (evt) => {
      touching = true
      if (evt.button === 0 && !evt.ctrlKey && !evt.shiftKey)
        this.editor.selection.clear();

      const selectStartTime = this.positionManager.getTimeAtPosition(evt.getLocalPosition(this).x);
      this.selectBox.visible = true;
      this.selectBox.width = 0;

      let position = evt.getLocalPosition(this).x;

      this.eventReceiver.onglobalpointermove = (evt) => {
        position = evt.getLocalPosition(this).x;
      };

      this.ontick = () => {
        const time = this.positionManager.getTimeAtPosition(position);

        const min = Math.min(time, selectStartTime);
        const max = Math.max(time, selectStartTime);

        this.selectBox.x = this.positionManager.getPositionForTime(min);
        this.selectBox.width = Math.abs(this.positionManager.getPositionForTime(max) - this.selectBox.x);

        const hitObjects = this.editor.beatmapManager.hitObjects.hitObjects.filter((obj) => obj.endTime >= min && obj.startTime <= max);
        this.editor.selection.selectAll(hitObjects);
      };

      addEventListener("pointerup", () => {
        this.eventReceiver.onglobalpointermove = null;
        this.ontick = undefined;
        this.selectBox.visible = false;
        touching = false
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
    this.maskSprite.y = -this.size.y * 0.5;
    this.maskSprite.scale.x = this.size.x;
    this.maskSprite.scale.y = this.size.y * 2;
    //this.eventReceiver.hitArea = new Rectangle(0, 0, this.size.x, this.size.y);
    this.selectBox.height = this.size.y;
    this.currentTimeMarker.position.set(
      this.size.x * 0.4,
      this.size.y * 0.5,
    );
    this.positionManager.availableWidth = this.size.x;
    this.controlPointTimeline.size.set(
      this.size.x,
      this.size.y * 0.25,
    );
    this.hitArea = new Rectangle(0, -10, this.size.x, this.size.y + 10);
  }

  private readonly tickPool: Tick[] = [];

  onTick() {

    const controlPoints = this.editor.beatmapManager.controlPoints;

    if (!controlPoints) return;

    const startTime = this.positionManager.startTime;
    const endTime = this.positionManager.endTime;

    const ticks = controlPoints.getTicks(startTime, endTime, this.beatInfo.beatSnap);

    const objectY = this.size.y * 0.5;

    for (let i = 0; i < ticks.length; i++) {
      let tick = this.tickContainer.children[i] as Tick | undefined;
      if (!tick) {
        tick = this.tickPool.pop() ?? new Tick();
        this.tickContainer.addChild(tick);
      }
      const x = this.positionManager.getPositionForTime(ticks[i].time);
      tick.position.set(x, objectY);
      tick.type = ticks[i].type;
    }
    if (ticks.length < this.tickContainer.children.length)
      this.tickPool.push(...(this.tickContainer.removeChildren(ticks.length) as Tick[]));

    this.tickPool.splice(30).forEach(tick => tick.destroy());

    //performance.mark("updateTicks-finished");
    //performance.measure("updateTicks-duration", "computeTicks-finished", "updateTicks-finished");

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
      timelineObject.destroy({children: true});
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