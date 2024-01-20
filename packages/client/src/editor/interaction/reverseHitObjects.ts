import {EditorInstance} from "../editorClient.ts";
import {HitObject, PathType, SerializedPathPoint, Slider, updateHitObject} from "@osucad/common";


export function reverseHitObjectsInteraction(editor: EditorInstance) {

  useEventListener("keydown", (evt) => {
    if (evt.ctrlKey && evt.code === "KeyG") {
      evt.preventDefault();
      const hitObjects = [...editor.selection.selectedObjects].sort((a, b) => a.startTime - b.startTime);

      reverseHitObjects(hitObjects, editor);
    }
  });
}

export function reverseHitObjects(hitObjects: HitObject[], editor: EditorInstance) {
  const startTimes = hitObjects.map(it => it.startTime);
  const endTimes = hitObjects.map(it => it.endTime);

  let time = startTimes[0];
  for (let i = hitObjects.length - 1; i >= 0; i--) {
    const hitObject = hitObjects[i];
    editor.commandManager.submit(updateHitObject(hitObject, { startTime: time }));
    if (i > 0)
      time += hitObjects[i].duration + (startTimes[i] - endTimes[i - 1]);

    if (hitObject instanceof Slider)
      reverseSliderPath(hitObject, editor);
  }
  editor.commandManager.commit();
}

export function reverseSliderPath(hitObject: Slider, editor: EditorInstance) {
  const controlPoints: SerializedPathPoint[] = [];
  const pathTypes = hitObject.path.controlPoints.map(it => it.type).filter(it => it !== null);

  const lastPoint = hitObject.path.controlPoints[hitObject.path.controlPoints.length - 1];
  for (let i = hitObject.path.controlPoints.length - 1; i >= 0; i--) {
    const point = hitObject.path.controlPoints[i];
    let type: PathType | null = null;
    if (controlPoints.length === 0 || point.type !== null && i !== 0)
      type = pathTypes.pop() ?? PathType.Bezier;

    controlPoints.push({
      x: point.x - lastPoint.x,
      y: point.y - lastPoint.y,
      type,
    });
  }

  editor.commandManager.submit(updateHitObject(hitObject, {
    position: hitObject.position.add(lastPoint),
    path: controlPoints,
  }));
}