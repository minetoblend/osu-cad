import type { BeatmapInfo as BeatmapInfoDto } from '@osucad/common';
import type { EditorContext } from '../editor/context/EditorContext';
import { OnlineEditorContext } from '../editor/context/OnlineEditorContext';
import type { BeatmapInfo } from './BeatmapInfo';

export class OnlineBeatmapInfo implements BeatmapInfo {
  constructor(
    dto: BeatmapInfoDto,
  ) {
    this.id = dto.id;
    this.setId = dto.setId;
    this.artist = dto.artist;
    this.title = dto.title;
    this.thumbnailSmall = dto.links.thumbnailSmall;
    this.thumbnailLarge = dto.links.thumbnailLarge;
    this.audioUrl = dto.links.audioUrl;
    this.difficultyName = dto.version;
    this.starRating = dto.starRating;
    this.lastEdited = dto.lastEdited ? new Date(dto.lastEdited) : null;

    this.joinKey = dto.links.edit.split('/').pop()!;
  }

  readonly id: string;

  readonly setId: string;

  readonly artist: string;

  readonly title: string;

  readonly difficultyName: string;

  readonly starRating: number;

  readonly lastEdited: Date | null;

  readonly thumbnailSmall: string | null;

  readonly thumbnailLarge: string | null;

  readonly audioUrl: string;

  readonly joinKey: string;

  readonly previewPoint: number | null = null;

  createEditorContext(): EditorContext {
    return new OnlineEditorContext(this.joinKey);
  }
}
