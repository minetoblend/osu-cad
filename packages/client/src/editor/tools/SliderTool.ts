import {ComposeTool} from "./ComposeTool.ts";
import {EditorCommand, HitCircle, hitObjectId, PathType, Slider, updateHitObject, Vec2} from "@osucad/common";
import {DestroyOptions, FederatedPointerEvent} from "pixi.js";
import {snapSliderLength} from "./snapSliderLength.ts";
import {SliderPathVisualizer} from "./SliderPathVisualizer.ts";
import {isMobile} from "@/util/isMobile.ts";

export class SliderTool extends ComposeTool {

  private previewObject?: HitCircle;
  private placingObject?: Slider;

  private sliderVisualizer = new SliderPathVisualizer();

  constructor() {
    super();
  }

  onLoad() {
    super.onLoad();
    this.previewObject = new HitCircle();
    if (!isMobile())
      this.editor.beatmapManager.hitObjects.add(this.previewObject);
    this.addChild(this.sliderVisualizer);

    this.onTick();
  }

  onTick() {
    if (this.previewObject) {
      if (this.mousePos)
        this.previewObject.position = this.mousePos;
      this.previewObject.startTime = this.editor.clock.currentTimeAnimated;
    }
  }

  destroy(options?: DestroyOptions) {
    super.destroy(options);
    if (this.previewObject)
      this.editor.beatmapManager.hitObjects.remove(this.previewObject);
  }

  protected onMouseDown(evt: FederatedPointerEvent) {
    const isTouch = evt.pointerType === 'touch';

    if (evt.button === 0 && this.previewObject) {
      this.editor.beatmapManager.hitObjects.remove(this.previewObject);

      const objectsAtTime = this.editor.beatmapManager.hitObjects.hitObjects.filter(it => Math.abs(it.startTime - this.previewObject!.startTime) < 0.5);
      for (const object of objectsAtTime) {
        this.submit(EditorCommand.deleteHitObject({
          id: object.id,
        }));
      }

      const slider = new Slider();
      slider.position = Vec2.from(evt.getLocalPosition(this));
      slider.startTime = this.editor.clock.currentTime;
      slider.path.controlPoints = [
        {x: 0, y: 0, type: PathType.Bezier},
        {x: 0, y: 0, type: null},
      ];
      if (isTouch)
        slider.path.controlPoints.pop()

      const previous = this.editor.beatmapManager.hitObjects.hitObjects.filter(it => it.startTime <= slider.startTime && it instanceof Slider).pop() as Slider | undefined;
      if (previous && previous.velocityOverride !== undefined) {
        slider.velocityOverride = previous.velocityOverride;
      }

      const id = hitObjectId();
      this.submit(EditorCommand.createHitObject({
        hitObject: {
          ...slider.serialize(),
          id,
          newCombo: this.previewObject.isNewCombo,
        },
      }));
      this.placingObject = this.editor.beatmapManager.hitObjects.getById(id) as Slider;
      this.sliderVisualizer.slider = this.placingObject;
      this.previewObject = undefined;
    } else if (evt.button === 0 && this.placingObject) {
      if (isTouch) {
        const mousePos = evt.getLocalPosition(this);
        const controlPoints = [...this.placingObject.path.controlPoints];
        const point = controlPoints[controlPoints.length - 1];

        if (Vec2.closerThan(Vec2.sub(mousePos, this.placingObject.position), point,
          isTouch ? 30 : 5
        )) {

          let type = point.type;
          switch (type) {
            case null:
              type = PathType.Bezier;
              break;
            case PathType.Bezier:
              type = PathType.Linear;
              break;
            case PathType.Linear:
              type = PathType.PerfectCurve;
              break;
            case PathType.PerfectCurve:
              type = null;
              break;
          }

          controlPoints[controlPoints.length - 1] = {...point, type};
          this.submit(updateHitObject(this.placingObject, {
            path: controlPoints,
          }));
          snapSliderLength(this.placingObject, this.editor, this.beatInfo);
          return;
        }

        const {segmentStart, type: segmentType} = this.currentSegmentStart(this.placingObject);
        const segmentLength = this.placingObject.path.controlPoints.length - segmentStart;

        if (segmentLength === 2 && segmentType === PathType.Bezier) {
          controlPoints[segmentStart] = {
            ...controlPoints[segmentStart],
            type: PathType.PerfectCurve,
          };
        } else if (segmentLength === 3 && segmentType === PathType.PerfectCurve) {
          controlPoints[segmentStart] = {
            ...controlPoints[segmentStart],
            type: PathType.Bezier,
          };
        }

        controlPoints.push({
          x: mousePos.x - this.placingObject.position.x,
          y: mousePos.y - this.placingObject.position.y,
          type: null,
        });

        this.submit(updateHitObject(this.placingObject, {
          path: controlPoints,
        }));
        snapSliderLength(this.placingObject, this.editor, this.beatInfo);

      } else {
        const mousePos = evt.getLocalPosition(this);
        const controlPoints = [...this.placingObject.path.controlPoints];
        const point = controlPoints[controlPoints.length - 2];

        if (Vec2.closerThan(Vec2.sub(mousePos, this.placingObject.position), point,
          isTouch ? 30 : 5
        )) {

          let type = point.type;
          switch (type) {
            case null:
              type = PathType.Bezier;
              break;
            case PathType.Bezier:
              type = PathType.Linear;
              break;
            case PathType.Linear:
              type = PathType.PerfectCurve;
              break;
            case PathType.PerfectCurve:
              type = null;
              break;
          }

          controlPoints[controlPoints.length - 2] = {...point, type};
          this.submit(updateHitObject(this.placingObject, {
            path: controlPoints,
          }));
          snapSliderLength(this.placingObject, this.editor, this.beatInfo);
          return;
        }

        const {segmentStart, type: segmentType} = this.currentSegmentStart(this.placingObject);
        const segmentLength = this.placingObject.path.controlPoints.length - segmentStart;

        if (evt.ctrlKey) {
          controlPoints[controlPoints.length - 1] = {
            ...controlPoints[controlPoints.length - 1],
            type: PathType.Bezier,
          };
          controlPoints.push({
            x: mousePos.x - this.placingObject.position.x,
            y: mousePos.y - this.placingObject.position.y,
            type: null,
          });

          this.submit(updateHitObject(this.placingObject, {
            path: controlPoints,
          }));
          snapSliderLength(this.placingObject, this.editor, this.beatInfo);
          return;
        }

        if (segmentLength === 2 && segmentType === PathType.Bezier) {
          controlPoints[segmentStart] = {
            ...controlPoints[segmentStart],
            type: PathType.PerfectCurve,
          };
        } else if (segmentLength === 3 && segmentType === PathType.PerfectCurve) {
          controlPoints[segmentStart] = {
            ...controlPoints[segmentStart],
            type: PathType.Bezier,
          };
        }

        controlPoints.push({
          x: mousePos.x - this.placingObject.position.x,
          y: mousePos.y - this.placingObject.position.y,
          type: null,
        });

        this.submit(updateHitObject(this.placingObject, {
          path: controlPoints,
        }));
        snapSliderLength(this.placingObject, this.editor, this.beatInfo);
      }


    }
    if (evt.button === 2 && this.placingObject) {
      this.editor.selection.select(this.placingObject);
      this.placingObject = undefined;
      this.sliderVisualizer.slider = null;
      this.previewObject = new HitCircle();
      this.previewObject.position = Vec2.from(evt.getLocalPosition(this));
      if (!isMobile())
        this.editor.beatmapManager.hitObjects.add(this.previewObject);
      this.editor.commandManager.commit();
    } else if (evt.button === 2 && !this.placingObject) {
      const closest = this.getClosestToClock(this.hoveredHitObjects);
      if (closest) {
        this.submit(EditorCommand.deleteHitObject({id: closest.id}), true);
      } else if (this.previewObject) {
        this.previewObject.isNewCombo = !this.previewObject.isNewCombo;
      }
    }
  }

  protected onMouseMove(evt: FederatedPointerEvent) {
    if (this.placingObject && this.placingObject.path.controlPoints.length > 1) {
      const slider = this.placingObject;
      const controlPoints = [...slider.path.controlPoints];
      const pos = evt.getLocalPosition(this);
      controlPoints[controlPoints.length - 1] = {
        ...controlPoints[controlPoints.length - 1],
        x: pos.x - slider.position.x,
        y: pos.y - slider.position.y,
      };
      this.submit(updateHitObject(slider, {
        path: controlPoints,
      }));
      snapSliderLength(slider, this.editor, this.beatInfo);
    }
  }

  private currentSegmentStart(slider: Slider) {
    for (let i = slider.path.controlPoints.length - 1; i >= 0; i--) {
      if (slider.path.controlPoints[i].type !== null) {
        return {segmentStart: i, type: slider.path.controlPoints[i].type};
      }
    }


    return {segmentStart: 0, type: null};
  }


}