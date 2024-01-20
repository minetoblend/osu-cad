import {Slider, updateHitObject} from "@osucad/common";
import {EditorInstance} from "../editorClient.ts";
import {BeatInfo} from "../beatInfo.ts";

export function snapSliderLength(slider: Slider, editor: EditorInstance, beatInfo: BeatInfo) {
  const length = slider!.path.totalLength;
  const duration = length / slider!.velocity;
  let time = editor.beatmapManager.controlPoints.snap(slider!.startTime + duration, beatInfo.beatSnap, "floor");
  const expectedDistance = slider!.velocity * (time - slider!.startTime);
  editor.commandManager.submit(updateHitObject(slider!, {
    expectedDistance,
  }));
}