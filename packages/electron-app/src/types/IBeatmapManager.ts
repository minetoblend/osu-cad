export interface IBeatmapManager {
  getAll(): Promise<IBeatmapEntity[]>;

  saveBeatmap(id: string, osuFileContent: string): Promise<boolean>
}

export interface IBeatmapEntity {
  id: string;
  unparseable: boolean;
  folderName: string;
  osuFileName: string;
  osucadFileName: string | null;
  sha1: string;
  artist: string;
  artistUnicode: string;
  title: string;
  titleUnicode: string;
  difficultyName: string;
  tags: string;
  creatorName: string;
  backgroundFileName: string | null;
  audioFileName: string;
  osuWebId: number;
  osuWebMapsetId: number;
  previewTime: number;
  starRating: number;
  needsStarRatingUpdate: boolean;
}
