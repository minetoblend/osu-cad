import type { ReadonlyDependencyContainer, Track } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { Beatmap } from '../beatmap/Beatmap';
import type { BeatmapColors } from '../beatmap/BeatmapColors';
import type { BeatmapDifficultyInfo } from '../beatmap/BeatmapDifficultyInfo';
import type { BeatmapMetadata } from '../beatmap/BeatmapMetadata';
import type { HitObjectList } from '../beatmap/HitObjectList';
import type { IFileStore } from '../beatmap/io/IFileStore';
import type { WorkingBeatmapSet } from '../beatmap/workingBeatmap/WorkingBeatmapSet';
import type { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import type { HitObject } from '../hitObjects/HitObject';
import { Bindable, Component, loadTexture } from 'osucad-framework';
import { UpdateHandler } from '../crdt/UpdateHandler';
import { IResourcesProvider } from '../io/IResourcesProvider';

export class EditorBeatmap<T extends HitObject = HitObject> extends Component {
  readonly track = new Bindable<Track>(null!);

  readonly backgroundTexture = new Bindable<Texture | null>(null);

  updateHandler!: UpdateHandler;

  constructor(
    readonly beatmap: Beatmap<T>,
    readonly fileStore: IFileStore,
    readonly beatmapSet?: WorkingBeatmapSet,
  ) {
    super();
  }

  static fromBeatmapSet<T extends HitObject>(beatmap: Beatmap<T>, beatmapSet: WorkingBeatmapSet) {
    return new EditorBeatmap(beatmap, beatmapSet.fileStore, beatmapSet);
  }

  get beatmapInfo() {
    return this.beatmap.beatmapInfo;
  }

  protected override get hasAsyncLoader(): boolean {
    return true;
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await super.loadAsync(dependencies);

    this.updateHandler = new UpdateHandler(this);

    await Promise.all([
      this.loadTrack(dependencies.resolve(IResourcesProvider)),
      this.loadBackground(),
    ]);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.hitObjects.applyDefaultsRequested.addListener(this.onApplyDefaultsRequested, this);
  }

  #updatedHitObjects = new Set<HitObject>();

  protected onApplyDefaultsRequested(hitObject: HitObject) {
    this.#updatedHitObjects.add(hitObject);
  }

  invalidateAllHitObjects() {
    for (const hitObject of this.hitObjects)
      this.#updatedHitObjects.add(hitObject);
  }

  applyDefaultsWhereNeeded(visibleStartTime: number = -Number.MAX_VALUE, visibleEndTime = Number.MAX_VALUE, limit = Number.MAX_VALUE) {
    let numApplied = 0;

    // Objects on screen should always get processed immediately
    for (const h of [...this.#updatedHitObjects]) {
      if (h.endTime > visibleStartTime && h.startTime < visibleEndTime) {
        this.beatmap.applyDefaultsTo(h);
        this.#updatedHitObjects.delete(h);
        numApplied++;
      }
    }

    for (const h of [...this.#updatedHitObjects]) {
      this.beatmap.applyDefaultsTo(h);
      this.#updatedHitObjects.delete(h);
      numApplied++;

      if (numApplied > limit)
        break;
    }
  }

  protected async loadTrack(resources: IResourcesProvider) {
    const path = this.beatmap.beatmapInfo.metadata.audioFile;
    const data = await this.fileStore.getFile(path)?.getData();
    if (!data)
      throw new Error(`Could not find asset "${path}" for beatmap track`);

    this.track.value = await resources.audioManager.createTrackFromArrayBuffer(resources.mixer.music, data);
  }

  protected async loadBackground() {
    const path = this.beatmap.beatmapInfo.metadata.backgroundFile;
    if (!path)
      return;
    const asset = await this.fileStore.getFile(path)?.getData();
    if (!asset)
      return;

    this.backgroundTexture.value = await loadTexture(asset);
  }

  get metadata(): BeatmapMetadata {
    return this.beatmap.metadata;
  }

  get difficulty(): BeatmapDifficultyInfo {
    return this.beatmap.difficulty;
  }

  get colors(): BeatmapColors {
    return this.beatmap.colors;
  }

  get controlPoints(): ControlPointInfo {
    return this.beatmap.controlPoints;
  }

  get hitObjects(): HitObjectList<T> {
    return this.beatmap.hitObjects;
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.hitObjects.applyDefaultsRequested.addListener(this.onApplyDefaultsRequested, this);
  }
}

type EditorBeatmapCommand =
  | { type: 'add'; hitObject: HitObject }
  | { type: 'remove'; id: string };
