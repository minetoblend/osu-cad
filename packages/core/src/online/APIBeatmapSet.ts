export interface APIBeatmapSet {
  id: string;
  title: string;
  artist: string;
  beatmaps: APIBeatmap[];
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
  backgroundUrl: string | null;
}
