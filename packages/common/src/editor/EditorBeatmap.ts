import type { Track } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { Beatmap } from '../beatmap/Beatmap';
import type { BeatmapColors } from '../beatmap/BeatmapColors';
import type { BeatmapDifficultyInfo } from '../beatmap/BeatmapDifficultyInfo';
import type { BeatmapMetadata } from '../beatmap/BeatmapMetadata';
import type { IFileStore } from '../beatmap/io/IFileStore';
import type { WorkingBeatmapSet } from '../beatmap/workingBeatmap/WorkingBeatmapSet';
import type { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import type { HitObject } from '../hitObjects/HitObject';
import type { IResourcesProvider } from '../io/IResourcesProvider';
import { Action, Bindable, loadTexture } from 'osucad-framework';
import { AbstractCrdt } from '../crdt/AbstractCrdt';
import { UpdateHandler } from '../crdt/UpdateHandler';
import { binarySearch } from '../utils/binarySearch';

export class EditorBeatmap<T extends HitObject = HitObject> extends AbstractCrdt<EditorBeatmapCommand> {
  readonly track = new Bindable<Track>(null!);

  readonly backgroundTexture = new Bindable<Texture | null>(null);

  updateHandler!: UpdateHandler;

  constructor(
    readonly resourcesProvider: IResourcesProvider,
    readonly beatmap: Beatmap<T>,
    readonly fileStore: IFileStore,
    readonly beatmapSet?: WorkingBeatmapSet,
  ) {
    super();
  }

  static fromBeatmapSet<T extends HitObject>(resources: IResourcesProvider, beatmap: Beatmap<T>, beatmapSet: WorkingBeatmapSet) {
    return new EditorBeatmap(resources, beatmap, beatmapSet.fileStore, beatmapSet);
  }

  get beatmapInfo() {
    return this.beatmap.beatmapInfo;
  }

  async load(): Promise<void> {
    this.updateHandler = new UpdateHandler(this);

    await Promise.all([
      this.loadTrack(),
      this.loadBackground(),
    ]);
  }

  protected async loadTrack() {
    const path = this.beatmap.beatmapInfo.metadata.audioFile;
    const data = await this.fileStore.getFile(path)?.getData();
    if (!data)
      throw new Error(`Could not find asset "${path}" for beatmap track`);

    this.track.value = await this.resourcesProvider.audioManager.createTrackFromArrayBuffer(this.resourcesProvider.mixer.music, data);
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

  get hitObjects(): T[] {
    return this.beatmap.hitObjects;
  }

  readonly hitObjectAdded = new Action<T>();

  readonly hitObjectRemoved = new Action<T>();

  readonly #idMap = new Map<string, HitObject>();

  add(hitObject: T) {
    if (!this.#add(hitObject))
      return false;

    this.submitMutation(
      { type: 'add', hitObject },
      { type: 'remove', id: hitObject.id },
    );
    return true;
  }

  addUntracked(hitObject: T) {
    return this.#add(hitObject);
  }

  removeUntracked(hitObject: T) {
    return this.#remove(hitObject);
  }

  #add(hitObject: T) {
    if (this.#idMap.has(hitObject.id))
      return false;

    const { index } = binarySearch(hitObject.startTime, this.hitObjects, h => h.startTime);

    this.hitObjects.splice(index, 0, hitObject);

    hitObject.applyDefaults(this.controlPoints, this.difficulty);

    this.hitObjectAdded.emit(hitObject);

    return true;
  }

  remove(hitObject: T) {
    if (!this.#remove(hitObject))
      return false;

    this.submitMutation(
      { type: 'remove', id: hitObject.id },
      { type: 'add', hitObject },
    );

    return true;
  }

  #remove(hitObject: T) {
    if (!this.#idMap.delete(hitObject.id))
      return false;

    const index = this.hitObjects.indexOf(hitObject);
    if (index < 0)
      return false;

    this.hitObjects.splice(index);
    this.hitObjectRemoved.emit(hitObject);
    return true;
  }

  override handle(mutation: EditorBeatmapCommand): void | EditorBeatmapCommand | null {
    switch (mutation.type) {
      case 'add':
        if (this.#add(mutation.hitObject as T))
          return { type: 'remove', id: mutation.hitObject.id };
        break;
      case 'remove':
      {
        const hitObject = this.#idMap.get(mutation.id);
        if (hitObject) {
          this.#add(hitObject as T);
          return { type: 'add', hitObject };
        }
      }
    }

    return null;
  }

  override get childObjects(): readonly AbstractCrdt<any>[] {
    return [this.beatmap];
  }
}

type EditorBeatmapCommand =
  | { type: 'add'; hitObject: HitObject }
  | { type: 'remove'; id: string };
