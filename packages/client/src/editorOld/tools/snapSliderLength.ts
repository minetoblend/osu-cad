import { Slider, updateHitObject } from '@osucad/common';
import { BeatInfo } from '../beatInfo.ts';
import { EditorContext } from '@/editorOld/editorContext.ts';

export function snapSliderLength(
  slider: Slider,
  editor: EditorContext,
  beatInfo: BeatInfo,
) {
  const length = slider!.path.totalLength;
  const duration = length / slider!.velocity;
  const time = editor.beatmapManager.controlPoints.snap(
    slider!.startTime + duration,
    beatInfo.beatSnap,
    'floor',
  );
  const expectedDistance = slider!.velocity * (time - slider!.startTime);
  editor.commandManager.submit(
    updateHitObject(slider!, {
      expectedDistance,
    }),
  );
}
