import { Component } from "@/editor/drawables/Component.ts";
import { Inject } from "@/editor/drawables/di";
import { TimelinePositionManager } from "@/editor/drawables/timeline/timelinePositionManager.ts";
import { ControlPoint, EditorCommand, hitObjectId, Vec2 } from "@osucad/common";
import { MapContainer } from "@/editor/drawables/timeline/MapContainer.ts";
import { ControlPointMarker } from "@/editor/drawables/timeline/ControlPointMarker.ts";
import { EditorContext } from "@/editor/editorContext.ts";
import { FederatedPointerEvent, ObservablePoint, Rectangle } from "pixi.js";
import { BeatInfo } from "@/editor/beatInfo.ts";
import { usePixiPopover } from "@/editor/components/popover";
import ControlPointPopover from "@/editor/components/popover/ControlPointPopover.vue";
import { onEditorKeyDown } from "@/composables/onEditorKeyDown.ts";

export class ControlPointTimeline extends Component {
  @Inject(TimelinePositionManager)
  private positionManager!: TimelinePositionManager;

  @Inject(EditorContext)
  private editor!: EditorContext;

  @Inject(BeatInfo)
  private beatInfo!: BeatInfo;

  private readonly previewPoint = new ControlPointMarker(
    new ControlPoint({
      id: "",
      time: 0,
      timing: null,
      velocityMultiplier: null,
    }),
  );

  private readonly timingPointContainer = new MapContainer<ControlPoint>({
    createContainer: (controlPoint) => new ControlPointMarker(controlPoint),
  });

  constructor() {
    super();
    this.addChild(this.timingPointContainer, this.previewPoint);
    this.eventMode = "static";

    this.previewPoint.alpha = 0.5;
    this.previewPoint.visible = false;
    this.previewPoint.eventMode = "none";
  }

  onLoad() {
    this.on("pointermove", this.onPointerMove, this);
    this.on("pointerout", this.onPointerLeave, this);
    this.on("pointerdown", this.onPointerDown, this);

    onEditorKeyDown((evt) => {
      if (evt.ctrlKey && evt.key === "p") {
        evt.preventDefault();
        const id = hitObjectId();
        const time = this.editor.clock.currentTime;
        const controlPoint = new ControlPoint({
          id,
          time,
          velocityMultiplier: null,
          timing:
            this.editor.beatmapManager.controlPoints.timingPointAt(time).timing,
        });
        this.editor.commandManager.submit(
          EditorCommand.createControlPoint({
            controlPoint: controlPoint.serialize(),
          }),
        );
        this.editor.commandManager.commit();
        const createdControlPoint =
          this.editor.beatmapManager.controlPoints.getById(controlPoint.id);
        this.showPopover(createdControlPoint!);
      } else if (evt.ctrlKey && evt.key === "P") {
        evt.preventDefault();
        evt.preventDefault();
        const id = hitObjectId();
        const time = this.editor.clock.currentTime;
        const controlPoint = new ControlPoint({
          id,
          time,
          velocityMultiplier:
            this.editor.beatmapManager.controlPoints.getVelocityAt(time),
          timing: null,
        });
        this.editor.commandManager.submit(
          EditorCommand.createControlPoint({
            controlPoint: controlPoint.serialize(),
          }),
        );
        this.editor.commandManager.commit();
        const createdControlPoint =
          this.editor.beatmapManager.controlPoints.getById(controlPoint.id);
        this.showPopover(createdControlPoint!);
      }
    });
  }

  get hasTimingPoints() {
    return this.editor.beatmapManager.controlPoints.timing.length > 0;
  }

  onTick() {
    const controlPoints = this.editor.beatmapManager.controlPoints;
    const startTime = this.positionManager.startTime;
    const endTime = this.positionManager.endTime;

    const timingPoints: ControlPoint[] = controlPoints.controlPoints.filter(
      (it) => it.time >= startTime && it.time <= endTime,
    );

    this.timingPointContainer.updateChildren(timingPoints);

    if (this.mousePos) {
      let time = this.positionManager.getTimeAtPosition(this.mousePos.x);
      if (this.shouldSnap && this.hasTimingPoints)
        time = this.beatInfo.snap(time);
      this.canPlace = !controlPoints.controlPoints.some(
        (it) => Math.abs(it.time - time) < 0.01,
      );
      this.previewPoint.controlPoint.time = time;
      this.previewPoint.visible = this.canPlace;
    } else {
      this.previewPoint.visible = false;
    }
  }

  private mousePos?: Vec2;
  private shouldSnap = false;
  private canPlace = true;

  private onPointerMove(event: FederatedPointerEvent) {
    if (!event.isPrimary) return;

    if (!event.ctrlKey) {
      this.mousePos = undefined;
      return;
    }

    this.mousePos = event.getLocalPosition(this);
    this.shouldSnap = !event.shiftKey;
  }

  private onPointerLeave() {
    this.mousePos = undefined;
  }

  private onPointerDown(event: FederatedPointerEvent) {
    if (event.button !== 0) return;
    event.stopPropagation();

    if (event.ctrlKey && this.canPlace) {
      event.preventDefault();
      const time = this.previewPoint.controlPoint.time;

      const controlPoint = new ControlPoint({
        id: hitObjectId(),
        time,
        velocityMultiplier:
          this.editor.beatmapManager.controlPoints.getVelocityAt(time),
        timing: null,
      });

      if (!this.hasTimingPoints) {
        controlPoint.timing = {
          beatLength: 60_000 / 170,
        };
      }

      this.editor.commandManager.submit(
        EditorCommand.createControlPoint({
          controlPoint: controlPoint.serialize(),
        }),
      );
      this.editor.commandManager.commit();

      const createdControlPoint =
        this.editor.beatmapManager.controlPoints.getById(controlPoint.id);

      this.showPopover(createdControlPoint!);
    }
  }

  showPopover(controlPoint: ControlPoint) {
    usePixiPopover().showPopover({
      position: {
        x:
          this.worldTransform.tx +
          this.positionManager.getPositionForTime(controlPoint.time) *
            this.worldTransform.a,
        y: this.getGlobalPosition().y - 10,
      },
      component: ControlPointPopover,
      props: {
        controlPoint: controlPoint,
        positionManager: this.positionManager,
      },
      anchor: "top right",
    });
  }

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    this.hitArea = new Rectangle(0, -10, this.size.x, this.size.y + 10);
  }
}
