import { ComposeTool } from '@/editorOld/tools/ComposeTool.ts';
import { Assets, FederatedPointerEvent, Point, Sprite } from 'pixi.js';
import { ShortcutId } from '@/editorOld/shortcuts';
import {
  EditorCommand,
  HitCircle,
  HitObject,
  hitObjectId,
  PathType,
  Slider,
  Vec2,
} from '@osucad/common';

export class LiveMappingTool extends ComposeTool {
  constructor() {
    super();
    this.cursor = 'none';
  }

  cursorSprite = new Sprite({
    texture: Assets.get('cursor'),
    anchor: new Point(0.5, 0.5),
  });

  onLoad() {
    super.onLoad();
    this.addChild(this.cursorSprite);
  }

  placingObject?: HitObject;

  private placingKey?: string;
  private leftKey = 'c';
  private rightKey = 'b';

  private cursorPath: Vec2[] = [];

  protected onKeyDown(evt: KeyboardEvent, shortcut?: ShortcutId) {
    super.onKeyDown(evt, shortcut);

    if (evt.key.length === 1) {
      evt.preventDefault();
      evt.stopPropagation();
      if (this.placingKey === evt.key) return;

      const offset = 50;

      const time = this.beatInfo.snap(this.currentTime - offset);

      const existingObjects =
        this.editor.beatmapManager.hitObjects.hitObjects.filter(
          (obj) => obj.startTime === time,
        );
      for (const object of existingObjects) {
        this.submit(
          EditorCommand.deleteHitObject({
            id: object.id,
          }),
        );
      }

      this.finishPlacing();
      const circle = new HitCircle();
      circle.position = this.mousePos;
      circle.startTime = time;
      this.submit(
        EditorCommand.createHitObject({
          hitObject: circle.serialize(),
        }),
        true,
      );

      this.placingObject = circle;
      this.placingKey = evt.key;
    }
  }

  onKeyUp(evt: KeyboardEvent, shortcut?: ShortcutId) {
    super.onKeyUp(evt, shortcut);
    if (this.placingKey === evt.key) {
      this.finishPlacing();
    }
  }

  protected onMouseMove(evt: FederatedPointerEvent) {
    super.onMouseMove(evt);
    if (this.placingObject) {
      this.cursorPath.push(this.mousePos);
    }
  }

  onTick() {
    super.onTick();

    this.cursorSprite.position = this.mousePos;

    const object = this.placingObject;
    if (object) {
      const time = this.currentTime - 50;
      if (
        time > object.startTime + this.beatInfo.beatLength / 4 &&
        this.cursorPath.length > 0
      ) {
        const pathStart = this.cursorPath[0];
        const pathEnd = this.cursorPath[this.cursorPath.length - 1];

        if (Vec2.distance(pathStart, pathEnd) > 20) {
          const path = [this.cursorPath[0]];

          for (let i = 1; i < this.cursorPath.length - 1; i++) {
            if (Vec2.distance(path[path.length - 1], this.cursorPath[i]) > 50) {
              path.push(this.cursorPath[i]);
            }
          }

          path.push(this.cursorPath[this.cursorPath.length - 1]);

          console.log(object);

          let slider: Slider;
          if (object instanceof Slider) {
            slider = object;
          } else {
            this.submit(EditorCommand.deleteHitObject({ id: object.id }));
            slider = new Slider();
            slider.startTime = object.startTime;
            slider.position = object.position;
          }

          slider.path.controlPoints = path.map((point, i) => ({
            type: i === 0 ? PathType.PerfectCurve : null,
            x: point.x - pathStart.x,
            y: point.y - pathStart.y,
          }));
          slider.path.invalidate();
          slider.applyDefaults(
            this.editor.beatmapManager.beatmap.difficulty,
            this.editor.beatmapManager.beatmap.controlPoints,
          );

          const length = slider.path.totalLength;

          const duration = time - object.startTime;

          slider.velocityOverride = 1;

          slider.velocityOverride = slider.duration / duration;
          slider.expectedDistance = length;

          if (slider.velocityOverride <= 0 || isNaN(slider.velocityOverride)) {
            slider.velocityOverride = 1;
          }

          if (object instanceof Slider) {
            this.submit(
              EditorCommand.updateHitObject({
                hitObject: slider.id,
                update: {
                  path: slider.path.controlPoints,
                  expectedDistance: slider.expectedDistance,
                  velocity: slider.velocityOverride,
                },
              }),
            );
          } else {
            slider.id = hitObjectId();
            this.submit(
              EditorCommand.createHitObject({
                hitObject: slider.serialize(),
              }),
            );

            this.placingObject = this.editor.beatmapManager.hitObjects.getById(
              slider.id,
            );
          }
        }
      }
    }
  }

  private finishPlacing() {
    this.placingKey = undefined;
    this.placingObject = undefined;
    this.cursorPath = [];
  }
}
