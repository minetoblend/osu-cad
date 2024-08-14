import type { BeatmapInfo as BeatmapInfoDto, UserInfo } from '@osucad/common';
import type { Texture } from 'pixi.js';
import { loadTexture } from 'osucad-framework';
import type { EditorContext } from '../editor/context/EditorContext';
import { OnlineEditorContext } from '../editor/context/OnlineEditorContext';
import type { BeatmapItemInfo } from '../beatmapSelect/BeatmapItemInfo';

export class OnlineBeatmapInfo implements BeatmapItemInfo {
  constructor(
    dto: BeatmapInfoDto,
  ) {
    this.id = dto.id;
    this.setId = dto.setId;
    this.author = dto.creator;
    this.authorName = dto.creator.username;
    this.artist = dto.artist;
    this.title = dto.title;
    this.thumbnailSmall = dto.links.thumbnailSmall;
    this.thumbnailLarge = dto.links.thumbnailLarge;
    this.audioUrl = dto.links.audioUrl;
    this.difficultyName = dto.version;
    this.starRating = dto.starRating;
    this.lastEdited = dto.lastEdited ? new Date(dto.lastEdited) : null;
    this.previewPoint = dto.previewTime ? dto.previewTime : null;

    this.joinKey = dto.links.edit.split('/').pop()!;
  }

  readonly id: string;

  readonly setId: string;

  readonly author: UserInfo;

  readonly authorName: string;

  readonly artist: string;

  readonly title: string;

  readonly difficultyName: string;

  readonly starRating: number;

  readonly lastEdited: Date | null;

  readonly thumbnailSmall: string | null;

  readonly thumbnailLarge: string | null;

  readonly audioUrl: string;

  readonly joinKey: string;

  readonly previewPoint: number | null;

  createEditorContext(): EditorContext {
    return new OnlineEditorContext(this.joinKey);
  }

  async loadThumbnailSmall(): Promise<Texture | null> {
    return this.thumbnailSmall ? loadTexture(this.thumbnailSmall) : null;
  }

  async loadThumbnailLarge(): Promise<Texture | null> {
    return this.thumbnailLarge ? loadTexture(this.thumbnailLarge) : null;
  }
}
