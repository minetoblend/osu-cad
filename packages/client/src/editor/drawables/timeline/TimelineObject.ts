import {Drawable} from "../Drawable.ts";
import {
  Assets,
  BitmapText,
  Circle,
  Container,
  DestroyOptions,
  FederatedPointerEvent,
  Point,
  Sprite,
  Texture,
} from "pixi.js";
import {HitObject, Slider, Spinner, updateHitObject} from "@osucad/common";
import {ObjectTimeline, TimelineVisibility} from "./ObjectTimeline.ts";
import {Inject} from "../di";
import sizeewcursor from "@/assets/icons/cursor-sizeew.svg";
import {clamp} from "@vueuse/core";
import {BeatInfo} from "../../beatInfo.ts";
import {EditorContext} from "@/editor/editorContext.ts";
import {TimelinePositionManager} from "@/editor/drawables/timeline/timelinePositionManager.ts";

export class TimelineObject extends Drawable {

  private readonly sliderBodyBackground = new Sprite(Texture.WHITE);
  private readonly startCircle: TimelineCircle;
  private readonly repeats = new Container();
  private readonly endCircle: TimelineCircle;
  private readonly comboNumber = new BitmapText({
    text: "1",
    style: {
      fontFamily: "Nunito Sans",
      fontSize: 15,
      fill: 0xffffff,
    },
  });

  @Inject(EditorContext)
  private readonly editor!: EditorContext;

  getPositionForTime(time: number, visibility: TimelineVisibility) {
    return (time - visibility.startTime) / (visibility.endTime - visibility.startTime) * visibility.width;
  }

  svText: BitmapText = new BitmapText({
    visible: false,
    text: "sv: 1.0",
    style: {
      fontFamily: "Nunito Sans",
      fontSize: 12,
      fill: 0xffffff,
    },
    position: {x: 0, y: 13},
    eventMode: "static",
    hitArea: {
      contains: (x, y) =>
        this.svText.visible && x >= 0 && x <= this.svText.width && y >= 0 && y <= this.svText.height,
    },
    resolution: 2,
  });

  constructor(
    private readonly timeline: ObjectTimeline,
    hitObject: HitObject,
  ) {
    super();
    this.startCircle = new TimelineCircle(hitObject.startTime);
    this.endCircle = new TimelineCircle(hitObject.endTime);
    this.sliderBodyBackground.anchor.set(0, 0.5);
    this.comboNumber.anchor.set(0.5);
    this.addChild(this.sliderBodyBackground, this.endCircle, this.repeats, this.startCircle, this.comboNumber, this.svText);
    this.hitObject = hitObject;
    this.sliderBodyBackground.alpha = 0.75;

    this.endCircle.cursor = `url(${sizeewcursor}) 16 16, auto`;
    this.eventMode = "dynamic";

    this.x = this.timeline.positionManager.getPositionForTime(hitObject.startTime);

    this.generateRepeats();

    this.comboNumber.text = (hitObject.indexInCombo + 1).toString();

    this.installListeners();
    this.on("added", () => {
      const containers: Container[] = [];
      let parent = this.parent;
      while (parent) {
        if (parent.eventMode === "static" || parent.eventMode === "dynamic")
          containers.push(parent);
        parent = parent.parent;
      }
    });
  }

  @Inject(BeatInfo)
  private beatInfo!: BeatInfo;

  @Inject(TimelinePositionManager)
  private positionManager!: TimelinePositionManager;

  private installListeners() {
    const hitObject = this.hitObject!;

    this.on("pointerdown", (evt) => {
      evt.preventDefault();
      evt.stopImmediatePropagation();

      if (evt.button === 0) {
        const selection = this.editor.selection;
        if (evt.ctrlKey) {
          if (selection.isSelected(hitObject) && selection.size > 1) {
            selection.remove(hitObject);
            return;
          } else {
            selection.add(hitObject);
          }
        } else if (!selection.isSelected(hitObject)) {
          this.editor.selection.select(hitObject);
        }

        let lastPos = evt.getLocalPosition(this.timeline);
        let time = hitObject.startTime;
        const startTime = hitObject.startTime;

        const originalStartTimes = [...selection.selectedObjects].map(o => {
          return {
            object: o,
            time: o.startTime,
          };
        });

        const onMove = (evt: FederatedPointerEvent) => {
          const pos = evt.getLocalPosition(this.timeline);

          const delta = pos.x - lastPos.x;
          const deltaTime = delta / this.positionManager.pixelsPerMillisecond;

          time += deltaTime;

          const offset = this.editor.beatmapManager.controlPoints!.snap(time, this.beatInfo.beatSnap) - startTime;

          originalStartTimes.forEach(({object, time}) => {
            this.editor.commandManager.submit(updateHitObject(object, {
              startTime: time + offset,
            }));
          });

          lastPos = pos;
        };

        this.addEventListener("globalpointermove", onMove);
        addEventListener("pointerup", () => {
          this.removeEventListener("globalpointermove", onMove);
          this.editor.commandManager.commit();
        }, {once: true});
      }
    });

    this.endCircle.onpointerdown = (evt) => {
      if (evt.button !== 0)
        return;

      const hitObject = this.hitObject;

      if (!hitObject)
        return;

      if (hitObject instanceof Slider && !evt.shiftKey) {
        evt.preventDefault();
        evt.stopPropagation();

        this.onglobalpointermove = (evt) => {
          const pos = evt.getLocalPosition(this.timeline);
          const time = pos.x / this.positionManager.pixelsPerMillisecond + this.positionManager.startTime;


          const targetDuration = time - hitObject.startTime!;
          const repeats = Math.round(targetDuration / hitObject.spanDuration) - 1;

          this.editor.commandManager.submit(updateHitObject(hitObject, {
            repeats: Math.max(repeats, 0),
          }));
        };

        addEventListener("pointerup", () => {
          this.onglobalpointermove = null;
          this.editor.commandManager.commit();
        }, {once: true});
      } else if (evt.shiftKey && hitObject instanceof Slider) {
        evt.preventDefault();
        evt.stopPropagation();

        const onMove = (evt: FederatedPointerEvent) => {
          const pos = evt.getLocalPosition(this.timeline);
          let time = pos.x / this.positionManager.pixelsPerMillisecond + this.positionManager.startTime;
          time = this.editor.beatmapManager.controlPoints!.snap(time, this.beatInfo.beatSnap);

          const targetDuration = time - hitObject.startTime!;
          const velocityOverride = hitObject.velocity / hitObject.baseVelocity * hitObject.duration / targetDuration;

          this.editor.commandManager.submit(updateHitObject(hitObject, {
            velocity: clamp(velocityOverride, 0.1, 10),
          }));
        };

        this.addEventListener("globalpointermove", onMove);
        addEventListener("pointerup", () => {
          this.removeEventListener("globalpointermove", onMove);
          this.editor.commandManager.commit();
        }, {once: true});
      } else if (hitObject instanceof Spinner) {
        evt.preventDefault();
        evt.stopPropagation();

        const onMove = (evt: FederatedPointerEvent) => {
          const pos = evt.getLocalPosition(this.timeline);
          let time = pos.x / this.positionManager.pixelsPerMillisecond + this.positionManager.startTime;
          time = this.editor.beatmapManager.controlPoints!.snap(time, this.beatInfo.beatSnap);

          const targetEndTime = time;
          const endTime = this.editor.beatmapManager.controlPoints.snap(targetEndTime, this.beatInfo.beatSnap);

          this.editor.commandManager.submit(updateHitObject(hitObject, {
            duration: Math.max(endTime - hitObject.startTime, this.editor.beatmapManager.controlPoints.timingPointAt(hitObject.startTime).timing.beatLength / this.beatInfo.beatSnap),
          }));
        };

        this.addEventListener("globalpointermove", onMove);
        addEventListener("pointerup", () => {
          this.removeEventListener("globalpointermove", onMove);
          this.editor.commandManager.commit();
        }, {once: true});
      }
    };

    this.svText.on("pointerdown", evt => {
      if (evt.button === 2) {
        this.editor.commandManager.submit(updateHitObject(this.hitObject!, {
          velocity: null,
        }));
      }
    });
  }

  onLoad() {
    if (this.hitObject) {
      const selected = this.editor.selection.isSelected(this.hitObject);
      this.startCircle.selected = selected;
      this.endCircle.selected = selected;

      const {off: offSelected} = this.editor.selection.hitObjectSelected.on((hitObject) => {
        if (hitObject === this.hitObject) {
          this.startCircle.selected = true;
          this.endCircle.selected = true;
        }
      });

      const {off: offDeselected} = this.editor.selection.hitObjectDeselected.on((hitObject) => {
        if (hitObject === this.hitObject) {
          this.startCircle.selected = false;
          this.endCircle.selected = false;
        }
      });

      this.on("destroyed", () => {
        offSelected();
        offDeselected();
      });
    }

  }

  private _hitObject?: HitObject;

  get hitObject() {
    return this._hitObject;
  }

  set hitObject(hitObject: HitObject | undefined) {
    if (this._hitObject) this._hitObject.onUpdate.removeListener(this.onHitObjectUpdate);
    this._hitObject = hitObject;
    this.visible = !!hitObject;
    hitObject?.onUpdate.addListener(this.onHitObjectUpdate);
  }

  set comboColor(color: number) {
    this.startCircle.comboColor = color;
    this.endCircle.comboColor = color;
    for (const child of this.repeats.children) {
      const circle = child as TimelineCircle;
      circle.comboColor = color;
    }
    this.sliderBodyBackground.tint = color;
  }

  onTick() {
    if (!this.isLoaded) return;
    const hitObject = this.hitObject;
    if (!hitObject) return;

    const comboColors = this.editor.beatmapManager.beatmap.colors;
    this.comboColor = comboColors[hitObject.comboIndex % comboColors.length];

    this.x = this.positionManager.getPositionForTime(hitObject.startTime);

    let endTime = hitObject.endTime;
    if (hitObject instanceof Slider)
      endTime = hitObject.startTime + hitObject.spanDuration * hitObject.spans;

    this.endCircle.x = this.positionManager.getPositionForTime(endTime) - this.x;
    for (const child of this.repeats.children) {
      const circle = child as TimelineCircle;
      circle.x = this.positionManager.getPositionForTime(circle.time) - this.x;
    }

    this.sliderBodyBackground.scale.x = this.endCircle.x;
    this.sliderBodyBackground.height = 30;

    // this.hitArea = new Rectangle(-hitObject.radius, -hitObject.radius, this.endCircle.x + hitObject.radius * 2, hitObject.radius * 2);

    this.endCircle.visible = endTime > hitObject.startTime;
    this.endCircle.eventMode = (endTime > hitObject.startTime) ? "dynamic" : "none";
    this.sliderBodyBackground.visible = endTime > hitObject.startTime;

    if (this.hitObject instanceof Slider && this.hitObject.velocityOverride !== null) {
      this.svText.visible = true;
      this.svText.text = `sv: ${(this.hitObject.velocityOverride!).toFixed(2)}x`;
    } else {
      this.svText.visible = false;
    }
  }

  private generateRepeats() {
    this.repeats.removeChildren();
    if (this.hitObject instanceof Slider) {
      for (let i = 1; i <= this.hitObject.repeats; i++) {
        const time = this.hitObject.startTime + this.hitObject.spanDuration * i;
        const circle = new TimelineRepeatCircle(time);

        this.repeats.addChild(circle);
      }
    }
  }

  readonly onHitObjectUpdate = (key: string) => {
    if (key === "startTime" || key === "position" || key === "repeats" || key === "velocity" || true)
      this.generateRepeats();

    this.comboNumber.text = (this.hitObject!.indexInCombo + 1).toString();
  };

  destroy(options?: DestroyOptions) {
    super.destroy(options);
  }


}

class TimelineCircle extends Drawable {

  private _selected = false;

  set comboColor(color: number) {
    this.hitcircle.tint = color;
  }

  constructor(public time: number) {
    super();
    this.hitcircle.anchor.set(0.5);
    this.hitcircleoverlay.anchor.set(0.5);
    this.selectionCircle.anchor.set(0.5);
    this.addChild(this.selectionCircle, this.hitcircle, this.hitcircleoverlay);
    this.scale.set(0.25);
    this.hitArea = new Circle(0, 0, 59);
    this.eventMode = "dynamic";
    this.selectionCircle.visible = false;
  }

  private readonly hitcircle = new Sprite(Assets.get("hitcircle"));
  private readonly hitcircleoverlay = new Sprite(Assets.get("hitcircleoverlay"));
  private readonly selectionCircle = new Sprite(Assets.get("hitcircleselect"));

  get selected() {
    return this._selected;
  }

  set selected(selected: boolean) {
    this._selected = selected;
    this.selectionCircle.visible = selected;
  }
}

export class TimelineRepeatCircle extends TimelineCircle {
  constructor(time: number) {
    super(time);

    this.addChild(new Sprite(
      {
        texture: Assets.get("reversearrow"),
        anchor: new Point(0.5, 0.5),
      },
    ));
  }

}