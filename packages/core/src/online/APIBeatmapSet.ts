export interface APIBeatmapSet {
  id: string;
  title: string;
  artist: string;
  creator: string;
  beatmaps: APIBeatmap[];
  covers: APIBeatmapCovers | null;
}

export interface APIBeatmap {
  id: string;
  difficultyName: string;
  artist: string;
  artistUnicode: string;
  title: string;
  titleUnicode: string;
  creator: string;
  audioUrl: string;
  covers: APIBeatmapCovers | null;
}

export interface APIBeatmapCovers {
  large: string;
  list: string;
}
