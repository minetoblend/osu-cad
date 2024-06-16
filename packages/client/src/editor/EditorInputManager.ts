import { Component } from '@/framework/drawable/Component.ts';
import { resolved } from '@/framework/di/DependencyLoader.ts';
import { Beatmap } from '@osucad/common';
import { EditorClock } from '@/editor/EditorClock.ts';

export class EditorInputManager extends Component {
  receiveGlobalKeyboardEvents(): boolean {
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
    }
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  @resolved(EditorClock)
  clock!: EditorClock;

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
}
