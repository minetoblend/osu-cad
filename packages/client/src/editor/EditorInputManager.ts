import { Component } from '@/framework/drawable/Component.ts';
import { resolved } from '@/framework/di/DependencyLoader.ts';
import { Beatmap } from '@osucad/common';
import { EditorClock } from '@/editor/EditorClock.ts';
import { UIWheelEvent } from '@/framework/input/events/UIWheelEvent.ts';
import { VolumeSelector } from './bottomBar/VolumeSelector';
import { usePreferences } from '@/composables/usePreferences';

export class EditorInputManager extends Component {
  receiveGlobalKeyboardEvents(): boolean {
    return true;
  }

  receivePositionalInputAt(): boolean {
    return true;
  }

  onGlobalKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'z':
        if (!event.ctrlKey && !event.metaKey) {
          this.seekToStart();
        }
        break;
      case 'v':
        if (!event.ctrlKey && !event.metaKey) {
          this.seekToEnd();
        }
        break;
      case 'ArrowLeft':
        if (!event.ctrlKey && !event.metaKey) {
          this.seekRelative(-1);
        }
        break;
      case 'ArrowRight':
        if (!event.ctrlKey && !event.metaKey) {
          this.seekRelative(1);
        }
        break;
    }
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  @resolved(EditorClock)
  clock!: EditorClock;

  @resolved(VolumeSelector)
  volumeSelector!: VolumeSelector;

  seekRelative(ticks: number) {
    const controlPoint = this.beatmap.controlPoints.timingPointAt(
      this.clock.currentTime,
    );

    const time =
      this.clock.snap(this.clock.currentTime) +
      (ticks * controlPoint.timing.beatLength) / this.clock.beatSnapDivisor;

    this.clock.seek(time);
  }

  seekToStart() {
    const firstObject = this.beatmap.hitObjects.first;

    if (
      firstObject &&
      Math.abs(this.clock.currentTime - firstObject.startTime) > 5
    ) {
      this.clock.seek(firstObject.startTime);
    } else {
      this.clock.seek(0);
    }
  }

  seekToEnd() {
    const lastObject = this.beatmap.hitObjects.last;

    if (
      lastObject &&
      Math.abs(this.clock.currentTime - lastObject.endTime) > 5
    ) {
      this.clock.seek(lastObject.endTime);
    } else {
      this.clock.seek(this.clock.songDuration);
    }
  }

  onWheel(event: UIWheelEvent): boolean {
    if (!event.ctrl && !event.alt) {
      const fast = event.shift || this.clock.isPlaying;
      if (event.deltaY < 0) {
        this.seekRelative(fast ? -4 : -1);
      } else {
        this.seekRelative(fast ? 4 : 1);
      }
      return true;
    }

    if (!event.ctrl && event.alt) {
      this.volumeSelector.show(true);

      const { preferences } = usePreferences();

      let delta = event.deltaY / 100;
      if (event.shift) {
        delta *= 10;
      }

      preferences.audio.masterVolume = Math.min(
        100,
        Math.max(0, preferences.audio.masterVolume + delta * 100),
      );

      return true;
    }

    return false;
  }
}
