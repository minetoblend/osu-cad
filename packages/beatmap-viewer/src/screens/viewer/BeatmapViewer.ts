import type { Beatmap, EditorScreenManager } from '@osucad/common';
import type { KeyDownEvent } from 'osucad-framework';
import { Editor, EditorBeatmap } from '@osucad/common';
import { Key, MenuItem } from 'osucad-framework';
import { ViewportScreen } from './screens/viewport/ViewportScreen';

export class BeatmapViewer extends Editor {
  protected registerScreens(screenManager: EditorScreenManager) {
    screenManager.register(ViewportScreen);

    screenManager.setCurrentScreen(ViewportScreen);
  }

  createMenuItems(): MenuItem[] {
    const fileMenu = new MenuItem({
      text: 'File',
      items: [
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
          items: this.editorBeatmap.beatmapSet.beatmaps.map(beatmap =>
            new MenuItem({
              text: beatmap.metadata.difficultyName,
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

  switchDifficulty(beatmap: Beatmap) {
    const editorBeatmap = new EditorBeatmap(
      beatmap,
      this.editorBeatmap.fileStore,
      this.editorBeatmap.beatmapSet,
    );

    this.exit();
    this.screenStack.push(new BeatmapViewer(editorBeatmap));
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.Escape) {
      this.exit();
      return true;
    }

    return false;
  }
}
