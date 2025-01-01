export interface BeatmapSetResponse {
  id: number;
  artist: string;
  artist_unicode: string;
  creator: string;
  source: string;
  tags: string;
  title: string;
  title_unicode: string;
  favourite_count: number;
  hype: any;
  nsfw: boolean;
  offset: number;
  play_count: number;
  spotlight: boolean;
  status: string;
  track_id: any;
  user_id: number;
  video: boolean;
  bpm: number;
  can_be_hyped: boolean;
  deleted_at: any;
  discussion_enabled: boolean;
  discussion_locked: boolean;
  is_scoreable: boolean;
  last_updated: number;
  legacy_thread_url: string;
  nominations_summary: NominationsSummary;
  ranked: number;
  ranked_date: number;
  storyboard: boolean;
  submitted_date: number;
  availability: Availability;
  has_favourited: boolean;
  beatmaps: BeatmapSetResponseBeatmap[];
  converts: Convert[];
  current_nominations: Nomination[];
  description: Description;
  genre: Genre;
  language: Language;
  pack_tags: string[];
  ratings: number[];
  related_users: User[];
  last_checked: number;
  rating: number;
  covers: {
    'card': string;
    'card@2x': string;
    'cover': string;
    'cover@2x': string;
    'list': string;
    'list@2x': string;
    'slimcover': string;
    'slimcover@2x': string;
  };
}

export interface NominationsSummary {
  current: number;
  required: number;
}

export interface Availability {
  download_disabled: boolean;
  more_information: any;
}

export interface BeatmapSetResponseBeatmap {
  id: number;
  failed: any;
  exited: any;
  beatmapset_id: number;
  difficulty_rating: number;
  mode: string;
  status: string;
  total_length: number;
  user_id: number;
  version: string;
  accuracy: number;
  ar: number;
  bpm: number;
  convert: boolean;
  count_circles: number;
  count_sliders: number;
  count_spinners: number;
  cs: number;
  deleted_at: any;
  drain: number;
  hit_length: number;
  is_scoreable: boolean;
  mode_int: number;
  passcount: number;
  playcount: number;
  ranked: number;
  url: string;
  checksum: string;
  max_combo: any;
  last_updated: number;
  last_checked: number;
}

export interface Convert {
  id: number;
  failed: any;
  exited: any;
  beatmapset_id: number;
  difficulty_rating: number;
  mode: string;
  status: string;
  total_length: number;
  user_id: number;
  version: string;
  accuracy: number;
  ar: number;
  bpm: number;
  convert: boolean;
  count_circles: number;
  count_sliders: number;
  count_spinners: number;
  cs: number;
  deleted_at: any;
  drain: number;
  hit_length: number;
  is_scoreable: boolean;
  mode_int: number;
  passcount: number;
  playcount: number;
  ranked: number;
  url: string;
  checksum: string;
}

export interface Nomination {}

export interface Description {
  description: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Language {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  country_code: string;
}
