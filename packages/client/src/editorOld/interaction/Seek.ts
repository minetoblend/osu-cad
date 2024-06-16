import { EditorClock } from '../clock.ts';
import { BeatmapManager } from '../beatmapManager.ts';
import { SelectionManager } from '../selection.ts';
import { binarySearch } from '@osucad/common';
import { BeatInfo } from '../beatInfo.ts';
import { EditorViewportDrawable } from '../drawables/EditorViewportDrawable.ts';
import { onEditorKeyDown } from '@/composables/onEditorKeyDown.ts';

export function seekInteraction(
  clock: EditorClock,
  beatmapManager: BeatmapManager,
  selection: SelectionManager,
  beatInfo: BeatInfo,
  container: EditorViewportDrawable,
) {
  container.eventMode = 'static';
  container.hitArea = { contains: () => true };

  container.on('wheel', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    let beats = Math.sign(e.deltaY) / beatInfo.beatSnap;
    if (clock.isPlaying) beats = Math.sign(beats);
    else if (e.shiftKey) beats *= 4;
    seekRelative(beats);
    e.stopPropagation();
  });

  onEditorKeyDown((e, shortcut) => {
    switch (shortcut) {
      case 'clock.seek-backward':
      case 'clock.seek-backward-fast': {
        if (e.ctrlKey) {
          if (selection.size !== 0) return;
          const bookmarks = beatmapManager.beatmap.bookmarks;
          let { index } = binarySearch(
            clock.currentTime,
            bookmarks,
            (bookmark) => bookmark.time,
          );
          if (index > 0) index--;
          if (bookmarks[index].time < clock.currentTime)
            clock.seek(bookmarks[index].time);
          return;
        }

        let seekAmount = -1 / beatInfo.beatSnap;
        if (clock.isPlaying) seekAmount = Math.sign(seekAmount);
        else if (e.shiftKey) seekAmount *= 4;

        seekRelative(seekAmount);
        break;
      }
      case 'clock.seek-forward':
      case 'clock.seek-forward-fast': {
        if (e.ctrlKey) {
          if (selection.size !== 0) return;
          const bookmarks = beatmapManager.beatmap.bookmarks;
          let { index, found } = binarySearch(
            clock.currentTime,
            bookmarks,
            (bookmark) => bookmark.time,
          );
          if (found && index < bookmarks.length - 1) index++;
          if (bookmarks[index].time > clock.currentTime)
            clock.seek(bookmarks[index].time);
          return;
        }

        let seekAmount = 1 / beatInfo.beatSnap;
        if (clock.isPlaying) seekAmount = Math.sign(seekAmount);
        else if (e.shiftKey) seekAmount *= 4;

        seekRelative(seekAmount);
        break;
      }
      case 'clock.toggle-play':
        if (clock.isPlaying) clock.pause();
        else clock.play();
        break;

      case 'clock.seek-start':
        const firstHitObject = beatmapManager.hitObjects.hitObjects[0];
        if (firstHitObject && clock.currentTime === firstHitObject.startTime)
          clock.seek(0);
        else clock.seek(firstHitObject?.startTime ?? 0);
        break;
      case 'clock.seek-end':
        const lastHitObject =
          beatmapManager.hitObjects.hitObjects[
            beatmapManager.hitObjects.hitObjects.length - 1
          ];
        if (lastHitObject && clock.currentTime === lastHitObject.endTime)
          clock.seek(clock.songDuration);
        else clock.seek(lastHitObject?.startTime ?? 0);
        break;
      default:
        return;
    }
    e.preventDefault();
  });

  function seekRelative(beats: number) {
    const controlPoints = beatmapManager.controlPoints;
    const timingPoints = controlPoints.timingPointAt(clock.currentTime);
    const time =
      controlPoints.snap(clock.currentTime, beatInfo.beatSnap) +
      beats * timingPoints.timing.beatLength;
    clock.seek(time);
  }
}
