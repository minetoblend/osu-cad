import type {
  KeyDownEvent,
  KeyUpEvent,
} from 'osucad-framework';
import {
  BindableNumber,
  Component,
  dependencyLoader,
  Key,
  resolved,
} from 'osucad-framework';

import { Beatmap } from '../../../beatmap/Beatmap.ts';
import { OsucadConfigManager } from '../../../config/OsucadConfigManager.ts';
import { OsucadSettings } from '../../../config/OsucadSettings.ts';
import { UISamples } from '../../../UISamples.ts';
import { EditorClock } from '../../EditorClock.ts';

export class MetronomePlayer extends Component {
  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(Beatmap)
  beatmap!: Beatmap;

  @resolved(UISamples)
  uiSamples!: UISamples;

  audioOffset = new BindableNumber();

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  @dependencyLoader()
  load() {
    this.config.bindWith(
      OsucadSettings.AudioOffset,
      this.audioOffset,
    );
  }

  update() {
    super.update();

    if (!this.editorClock.isRunning || this.editorClock.isSeeking)
      return;

    const time = this.editorClock.timeInfo;

    const startTime = time.current - time.elapsed - this.audioOffset.value;
    const endTime = startTime + time.elapsed;

    const ticks = this.beatmap.controlPoints.tickGenerator.generateTicks(
      startTime,
      endTime,
      this.doubleSpeed ? 2 : 1,
    );

    for (const tick of ticks) {
      if (tick.time >= startTime && tick.time <= endTime) {
        const delay = tick.time - startTime;

        if (tick.isDownBeat)
          this.uiSamples.metronomeHigh.play({ delay });
        else
          this.uiSamples.metronomeLow.play({ delay });
      }
    }
  }

  doubleSpeed = false;

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.ControlLeft) {
      this.doubleSpeed = true;
    }

    return false;
  }

  onKeyUp(e: KeyUpEvent) {
    if (e.key === Key.ControlLeft)
      this.doubleSpeed = false;
  }
}
