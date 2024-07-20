import type { EditorContext } from '../editor/context/EditorContext';

export interface BeatmapInfo {
  readonly id: string;

  readonly setId: string;

  readonly artist: string;

  readonly title: string;

  readonly difficultyName: string;

  readonly starRating: number;

  readonly thumbnailSmall: string | null;

  readonly thumbnailLarge: string | null;

  readonly audioUrl: string;

  readonly lastEdited: Date | null;

  readonly previewPoint: number | null;

  createEditorContext: () => EditorContext;
}
