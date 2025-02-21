import type { EditorBeatmap } from '@osucad/core';
import type { ScreenExitEvent, ScreenTransitionEvent } from '@osucad/framework';
import { AudioMixer, OsucadScreen } from '@osucad/core';
import { AudioManager, Axes, LowpassFilter, resolved } from '@osucad/framework';
import { HomeScreenSongPlayback } from '../home/HomeScreenSongPlayback';
import { BeatmapViewer } from './BeatmapViewer';
import { EditorLoadingSpinner } from './EditorLoadingSpinner';

export class BeatmapViewerLoader extends OsucadScreen {
  constructor(
    readonly loadBeatmap: () => Promise<EditorBeatmap>,
  ) {
    super();
  }

  readonly #lowPassFilter = new LowpassFilter({
    frequency: 20000,
  });

  #loadingSpinner!: EditorLoadingSpinner;

  @resolved(AudioManager)
  audioManager!: AudioManager;

  @resolved(AudioMixer)
  mixer!: AudioMixer;

  @resolved(HomeScreenSongPlayback, true)
  songPlayback?: HomeScreenSongPlayback;

  override onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.mixer.music.addFilter(this.#lowPassFilter);

    this.#lowPassFilter.frequency!.exponentialRampToValueAtTime(
      300,
      this.audioManager.context.currentTime + 0.25,
    );

    this.#loadingSpinner = new EditorLoadingSpinner({
      relativeSizeAxes: Axes.Both,
    });

    this.addInternal(this.#loadingSpinner);

    this.loadBeatmap().then(async (beatmap) => {
      const { BeatmapViewer } = await import('./BeatmapViewer');

      const viewer = new BeatmapViewer(beatmap);

      try {
        await this.loadComponentAsync(viewer);
      }
      catch (e) {
        console.error(e);
      }

      this.screenStack.push(viewer);
    });
  }

  onSuspending(e: ScreenTransitionEvent) {
    super.onSuspending(e);

    this.songPlayback?.pause();

    this.mixer.music.removeFilter(this.#lowPassFilter);
  }

  onResuming(e: ScreenTransitionEvent) {
    super.onResuming(e);

    if (e.source && e.source instanceof BeatmapViewer && e.source.nextBeatmap) {
      this.screenStack.push(e.source.nextBeatmap);
      return;
    }

    this.schedule(() => this.exit());
  }

  override onExiting(e: ScreenExitEvent): boolean {
    if (super.onExiting(e))
      return true;

    this.songPlayback?.resume();

    return false;
  }
}
