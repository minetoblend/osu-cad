import type { Beatmap, EditorScreenManager } from '@osucad/core';
import type { Drawable, KeyDownEvent, ReadonlyDependencyContainer, ScreenExitEvent } from '@osucad/framework';
import type { BeatmapViewerGame } from '../../BeatmapViewerGame';
import { Editor, EditorBeatmap, ModdingScreen, PreferencesOverlay } from '@osucad/core';
import { Key, MenuItem, resolved } from '@osucad/framework';
import posthog from 'posthog-js';
import { Router } from '../Router';
import { BeatmapViewerLayout } from './BeatmapViewerLayout';
import { ViewportScreen } from './screens/viewport/ViewportScreen';

export class BeatmapViewer extends Editor {
  constructor(
    editorBeatmap: EditorBeatmap,
    readonly isEmbed: boolean = false,
  ) {
    super(editorBeatmap);
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await (this.game as BeatmapViewerGame).skinManagerLoaded;

    return super.loadAsync(dependencies);
  }

  protected loadComplete() {
    super.loadComplete();

    this.editorBeatmap.updateHandler.readonly = true;

    const { artist, title } = this.beatmap.metadata;

    posthog.capture('editor.view_beatmap', {
      beatmap: `${artist} ${title}`,
      difficultyName: this.beatmap.beatmapInfo.difficultyName,
    });
  }

  protected registerScreens(screenManager: EditorScreenManager) {
    screenManager.register(ViewportScreen);
    screenManager.register(ModdingScreen);

    screenManager.setCurrentScreen(ViewportScreen);

    screenManager.currentScreen.bindValueChanged((screen) => {
      posthog.capture('editor.change_editor_screen', {
        type: screen.value.name,
      });
    });
  }

  protected createLayout(): Drawable {
    return new BeatmapViewerLayout();
  }

  @resolved(() => Router)
  router!: Router;

  @resolved(PreferencesOverlay)
  preferences!: PreferencesOverlay;

  public override onExiting(e: ScreenExitEvent): boolean {
    if (this.isEmbed)
      return true;

    return super.onExiting(e);
  }

  createMenuItems(): MenuItem[] {
    const fileMenu = new MenuItem({
      text: 'File',
      items: [
        new MenuItem({
          text: 'Preferences',
          action: () => this.preferences.toggleVisibility(),
        }),
        ...(
          this.isEmbed
            ? []
            : [
                new MenuItem({
                  text: 'Exit',
                  action: () => this.exit(),
                }),
              ]
        ),
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
    if (this.isEmbed)
      return;

    this.router.goBack();
  }
}
