import {HitObject, Slider, updateHitObject, Vec2} from "@osucad/common";
import {EditorInstance} from "../editorClient.ts";

export function mirrorAlongAxis(
  hitObjects: HitObject[],
  axisFrom: Vec2,
  axisTo: Vec2,
  editor: EditorInstance,
) {

  for (const hitObject of hitObjects) {
    const position = hitObject.position;
    const angle = Math.atan2(axisTo.y - axisFrom.y, axisTo.x - axisFrom.x);

    const mirroredPosition = position
      .sub(axisFrom)
      .rotate(-angle)
      .mul(new Vec2(1, -1))
      .rotate(angle)
      .add(axisFrom);

    if (hitObject instanceof Slider) {
      const controlPoints = [...hitObject.path.controlPoints];
      for (let i = 0; i < controlPoints.length; i++) {
        const pos = Vec2.from(controlPoints[i]);
        const newPos = pos
          .rotate(-angle)
          .mul(new Vec2(1, -1))
          .rotate(angle);

        controlPoints[i] = {
          ...controlPoints[i],
          x: newPos.x,
          y: newPos.y,
        };
      }

      editor.commandManager.submit(updateHitObject(hitObject, {
        position: mirroredPosition,
        path: controlPoints,
      }));
      continue;
    }


    editor.commandManager.submit(updateHitObject(hitObject, {
      position: mirroredPosition,
    }));
  }

  editor.commandManager.commit();
}