import { Drawable } from './drawables/Drawable.ts';
import { Inject } from './drawables/di';
import { TickType } from '@osucad/common';
import { clamp } from '@vueuse/core';
import { EditorContext } from '@/editorOld/editorContext.ts';
import { onEditorKeyDown } from '@/composables/onEditorKeyDown.ts';

export class BeatInfo extends Drawable {
  @Inject(EditorContext)
  editor!: EditorContext;

  beatLength = 0;
  beatProgress = 0;

  beatSnap: number = TickType.Quarter;

  constructor() {
    super();
    this.eventMode = 'static';
    this.hitArea = { contains: () => true };
  }

  onTick() {
    const time = this.editor.clock.currentTimeAnimated;
    const controlPoints = this.editor.beatmapManager.controlPoints;

    const timingPoint = controlPoints.timingPointAt(time);

    this.beatLength = timingPoint.timing.beatLength;
    let progress = (time - timingPoint.time) / timingPoint.timing.beatLength;
    progress = mod(mod(progress, 1) + 1, 1);
    this.beatProgress = progress;
  }

  static availableBeatsnapTypes = [
    TickType.Full,
    TickType.Half,
    TickType.Third,
    TickType.Quarter,
    TickType.Sixth,
    TickType.Eighth,
    TickType.Twelfth,
    TickType.Sixteenth,
  ];

  onLoad() {
    useEventListener(
      'wheel',
      (evt) => {
        if (!evt.ctrlKey) return;
        evt.preventDefault();
        evt.stopPropagation();

        let index = BeatInfo.availableBeatsnapTypes.indexOf(this.beatSnap);
        if (index === -1) index = 1;
        index += Math.sign(evt.deltaY);
        index = clamp(index, 0, BeatInfo.availableBeatsnapTypes.length - 1);
        this.beatSnap = BeatInfo.availableBeatsnapTypes[index];
      },
      { passive: false },
    );

    onEditorKeyDown((evt) => {
      if (evt.shiftKey && evt.code.startsWith('Digit')) {
        evt.preventDefault();
        evt.stopPropagation();

        const digit = parseInt(evt.code[5]);
        if (digit >= 1 && digit <= 9) {
          if (BeatInfo.availableBeatsnapTypes.includes(digit as TickType))
            this.beatSnap = digit;
        }
      }
    });
  }

  snap(time: number) {
    return this.editor.beatmapManager.controlPoints.snap(time, this.beatSnap);
  }
}

function mod(a: number, n: number) {
  return ((a % n) + n) % n;
}
