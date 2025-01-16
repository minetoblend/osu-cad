import type { Beatmap, EditorScreenManager } from '@osucad/core';
import type { KeyDownEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import type { BeatmapViewerGame } from '../../BeatmapViewerGame';
import { ComposeScreen, Editor, EditorBeatmap, ModdingScreen, PreferencesContainer } from '@osucad/core';
import { Key, MenuItem, resolved } from '@osucad/framework';
import { Router } from '../Router';

export class BeatmapViewer extends Editor {
  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await (this.game as BeatmapViewerGame).skinManagerLoaded;

    return super.loadAsync(dependencies);
  }

  protected registerScreens(screenManager: EditorScreenManager) {
    screenManager.register(ComposeScreen);
    screenManager.register(ModdingScreen);

    screenManager.setCurrentScreen(ComposeScreen);
  }

  @resolved(() => Router)
  router!: Router;

  createMenuItems(): MenuItem[] {
    const fileMenu = new MenuItem({
      text: 'File',
      items: [
        new MenuItem({
          text: 'Preferences',
          action: () => this.findClosestParentOfType(PreferencesContainer)!.preferencesVisible.value = true,
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
