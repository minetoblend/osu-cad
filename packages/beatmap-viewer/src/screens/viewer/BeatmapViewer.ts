import type { Beatmap, EditorScreenManager } from '@osucad/core';
import type { Drawable, KeyDownEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import type { BeatmapViewerGame } from '../../BeatmapViewerGame';
import { ComposeScreen, Editor, EditorBeatmap, ModdingScreen, PreferencesOverlay } from '@osucad/core';
import { Key, MenuItem, resolved } from '@osucad/framework';
import { Router } from '../Router';
import { BeatmapViewerLayout } from './BeatmapViewerLayout';

export class BeatmapViewer extends Editor {
  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await (this.game as BeatmapViewerGame).skinManagerLoaded;

    return super.loadAsync(dependencies);
  }

  protected loadComplete() {
    super.loadComplete();

    // this.editorBeatmap.updateHandler.readonly = true;
  }

  protected registerScreens(screenManager: EditorScreenManager) {
    screenManager.register(ComposeScreen);
    screenManager.register(ModdingScreen);

    screenManager.setCurrentScreen(ComposeScreen);
  }

  protected createLayout(): Drawable {
    return new BeatmapViewerLayout();
  }

  @resolved(() => Router)
  router!: Router;

  @resolved(PreferencesOverlay)
  preferences!: PreferencesOverlay;

  createMenuItems(): MenuItem[] {
    const fileMenu = new MenuItem({
      text: 'File',
      items: [
        new MenuItem({
          text: 'Preferences',
          action: () => this.preferences.toggleVisibility(),
        }),
        new MenuItem({
          text: 'Exit',
          action: () => this.exit(),
        }),
      ],
    });

    if (this.editorBeatmap.beatmapSet && this.editorBeatmap.beatmapSet.beatmaps.length > 1) {
      fileMenu.items = [
        new MenuItem({
          text: 'Open difficulty',
          items: this.editorBeatmap.beatmapSet.beatmaps
            .map(beatmap =>
              new MenuItem({
                text: beatmap.beatmapInfo.difficultyName,
                disabled: this.beatmap === beatmap,
                action: () => this.switchDifficulty(beatmap),
              }),
            ),
        }),
        ...fileMenu.items,
      ];
    }

    return [
      fileMenu,
    ];
  }

  nextBeatmap?: BeatmapViewer;

  switchDifficulty(beatmap: Beatmap) {
    this.nextBeatmap = new BeatmapViewer(
      new EditorBeatmap(
        beatmap,
        this.editorBeatmap.fileStore,
        this.editorBeatmap.beatmapSet,
      ),
    );

    this.loadComponentAsync(this.nextBeatmap).finally(() => this.exit());
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.Escape) {
      this.exit();
      return true;
    }

    return false;
  }

  exit() {
    this.router.goBack();
  }
}
