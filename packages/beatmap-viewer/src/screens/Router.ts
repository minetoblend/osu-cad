import type { IScreen, ReadonlyDependencyContainer } from 'osucad-framework';
import { EditorBeatmap, OsucadScreenStack, WorkingBeatmapSet } from '@osucad/common';
import { provide } from 'osucad-framework';
import { CatboyMirror } from '../mirrors/CatboyMirror';
import { HomeScreen } from './home/HomeScreen';
import { BeatmapViewer } from './viewer/BeatmapViewer';
import { BeatmapViewerLoader } from './viewer/BeatmapViewerLoader';

export interface ShowBeatmapOptions {
  beatmapSet?: WorkingBeatmapSet | number;
  beatmap: number;
}

export type Route =
  | { type: 'home' }
  | { type: 'beatmap'; beatmap: number; beatmapSet: number };

@provide(Router)
export class Router extends OsucadScreenStack {
  constructor() {
    super();
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const onPopState = (evt: PopStateEvent) => this.scheduler.addOnce(this.updateFromPath, this);

    addEventListener('popstate', onPopState);
    this.onDispose(() => removeEventListener('popstate', onPopState));

    this.screenExited.addListener(() => {
      if (!this.currentScreen)
        this.presentHomeScreen();
    });
  }

  protected loadComplete() {
    super.loadComplete();

    this.updateFromPath();
  }

  goBack() {
    if (this.currentScreen)
      this.exit(this.currentScreen);
  }

  parsePath(path: string): Route {
    const beatmapRegex = /^\/b\/(\d+)\/(\d+)$/;

    const match = path.match(beatmapRegex);

    if (match) {
      const [_, beatmapSetId, beatmapId] = match;

      return {
        type: 'beatmap',
        beatmapSet: Number.parseInt(beatmapSetId),
        beatmap: Number.parseInt(beatmapId),
      };
    }

    return { type: 'home' };
  }

  #currentPath?: string;

  updateFromPath() {
    const path = window.location.pathname;

    if (this.#currentPath === path)
      return;

    this.#currentPath = path;

    const route = this.parsePath(path);

    if (!this.exitToHome())
      return;

    switch (route.type) {
      case 'home':
        this.presentHomeScreen();
        break;
      case 'beatmap':
        this.presentBeatmap(route);
        break;
    }
  }

  exitTo(predicate: (screen: IScreen) => boolean) {
    while (this.currentScreen && !predicate(this.currentScreen)) {
      if (!this.exit(this.currentScreen))
        return false;
    }
    return true;
  }

  exitToHome() {
    return this.exitTo(screen => screen instanceof HomeScreen);
  }

  presentHomeScreen() {
    this.exitToHome();

    if (!(this.currentScreen instanceof HomeScreen))
      this.push(new HomeScreen());
  }

  presentBeatmap(options: ShowBeatmapOptions) {
    this.exitToHome();

    this.push(new BeatmapViewerLoader(() => this.loadEditorBeatmap(options)));
  }

  async loadEditorBeatmap(options: ShowBeatmapOptions) {
    const mirror = new CatboyMirror();

    let mapset: WorkingBeatmapSet;
    if (!options.beatmapSet) {
      const { beatmapset_id } = await mirror.lookupBeatmap(options.beatmap);

      mapset = await mirror.loadBeatmapSet(beatmapset_id);
    }
    else if (options.beatmapSet instanceof WorkingBeatmapSet) {
      mapset = options.beatmapSet;
    }
    else {
      mapset = await mirror.loadBeatmapSet(options.beatmapSet);
    }

    const { osuWebId, osuWebSetId } = mapset.beatmaps[0].metadata;

    const beatmap = mapset.beatmaps.find(it => it.metadata.osuWebId === options.beatmap);
    if (!beatmap)
      throw new Error('Beatmap not found in mapset');

    return new EditorBeatmap(beatmap, mapset.fileStore, mapset);
  }

  push(screen: IScreen) {
    super.push(screen);

    this.#updatePathFromScreen();
  }

  exit(source: IScreen): boolean {
    const result = super.exit(source);

    this.#updatePathFromScreen();

    return result;
  }

  #updatePathFromScreen() {
    const screen = this.currentScreen;
    if (!screen)
      return;

    if (screen instanceof HomeScreen) {
      this.#pushPath('/');
    }
    else if (screen instanceof BeatmapViewer) {
      const { osuWebId, osuWebSetId } = screen.beatmap.metadata;
      this.#pushPath(`/b/${osuWebSetId}/${osuWebId}`);
    }
  }

  #pushPath(path: string) {
    if (window.location.pathname !== path)
      window.history.pushState({}, '', path);
    this.#currentPath = path;
  }
}
