import {
  BeatmapId,
  MapsetId,
  SerializedBeatmap,
  SerializedBeatmapDifficulty,
  SerializedBeatmapGeneral,
  SerializedMapset,
  SerializedMapsetMetadata,
} from '../protocol';
import { UserInfo } from '../types';
import { ControlPointManager } from './controlPointManager';
import { HitObjectManager } from './hitObjectManager';
import { EditorBookmark } from './bookmark';
import { Action } from '../util/action';
import { defaultHitSoundLayers, HitSoundManager } from './hitSoundManager';

export class Mapset {
  public id: string;
  public creator: UserInfo;
  public meatadata: MapsetMetadata;

  constructor(options: SerializedMapset) {
    this.id = options.id;
    this.creator = options.creator;
    this.meatadata = new MapsetMetadata(options.metadata);
  }

  serialize(): SerializedMapset {
    return {
      id: this.id,
      creator: this.creator,
      metadata: this.meatadata.serialize(),
    };
  }
}

export class Beatmap {
  public readonly id: BeatmapId;
  public setId: MapsetId;
  public readonly hitObjects: HitObjectManager;
  public controlPoints: ControlPointManager;
  public name: string;
  public difficulty: SerializedBeatmapDifficulty;
  public bookmarks: EditorBookmark[];
  public backgroundPath: string | null;
  public colors: number[] = [];
  public audioFilename: string;
  public general: SerializedBeatmapGeneral;
  public metadata: MapsetMetadata;
  public hitSounds: HitSoundManager;

  readonly onBookmarksChanged = new Action();

  constructor(options: SerializedBeatmap) {
    this.id = options.id;
    this.setId = options.setId;
    this.metadata = new MapsetMetadata(options.metadata);
    this.name = options.name;
    this.general = options.general ?? { stackLeniency: 0.7 };
    this.controlPoints = new ControlPointManager(options.controlPoints);
    this.difficulty = options.difficulty;
    this.hitObjects = new HitObjectManager(options.hitObjects, this);
    this.bookmarks = options.bookmarks
      .map((bookmark) => new EditorBookmark(bookmark))
      .filter((it) => it.time != undefined);
    this.backgroundPath = options.backgroundPath;
    this.colors = options.colors.map((color) =>
      parseInt(color.substring(1, 7), 16),
    );
    this.audioFilename = options.audioFilename;
    if (this.colors.length === 0) {
      this.colors = [0xff0000, 0x00ff00, 0x0000ff];
    }
    this.hitSounds = new HitSoundManager(
      options.hitSounds ?? { layers: defaultHitSoundLayers() },
    );
  }

  serialize(): SerializedBeatmap {
    return {
      id: this.id,
      setId: this.setId,
      metadata: this.metadata.serialize(),
      name: this.name,
      controlPoints: this.controlPoints.serialize(),
      hitObjects: this.hitObjects.serialize(),
      difficulty: this.difficulty,
      bookmarks: this.bookmarks.map((bookmark) => bookmark.serialize()),
      backgroundPath: this.backgroundPath,
      colors: this.colors.map(
        (color) => '#' + color.toString(16).padStart(6, '0'),
      ),
      audioFilename: this.audioFilename,
      general: this.general,
      hitSounds: this.hitSounds.serialize(),
    };
  }
}

export class MapsetMetadata {
  title: string;
  artist: string;
  tags: string;
  beatmapId: number;
  beatmapSetId: number;

  constructor(options: SerializedMapsetMetadata) {
    this.title = options.title;
    this.artist = options.artist;
    this.tags = options.tags;
    this.beatmapId = options.beatmapId;
    this.beatmapSetId = options.beatmapSetId;
  }

  serialize(): SerializedMapsetMetadata {
    return {
      title: this.title,
      artist: this.artist,
      tags: this.tags,
      beatmapId: this.beatmapId,
      beatmapSetId: this.beatmapSetId,
    };
  }
}
