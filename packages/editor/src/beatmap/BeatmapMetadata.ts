import type { IUser } from './IUser';

export class BeatmapMetadata {
  artist = '';
  artistUnicode = '';
  title = '';
  titleUnicode = '';
  source = '';
  tags = '';
  previewTime = '';
  author: IUser | null = null;
}
