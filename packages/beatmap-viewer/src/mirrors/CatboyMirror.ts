import type { Beatmap, IBeatmap } from '@osucad/common';
import type { BeatmapSetResponse } from './BeatmapSetResponse';
import { ResourceStoreBackedFileStore, StableBeatmapParser, WorkingBeatmapSet, ZipArchiveResourceStore } from '@osucad/common';
import { BeatmapMirror } from './BeatmapMirror';

export class CatboyMirror extends BeatmapMirror {
  constructor() {
    super('catboy.best');
  }

  readonly baseUrl = 'https://catboy.best';

  override async loadBeatmapSet(id: number): Promise<WorkingBeatmapSet> {
    const buffer = await fetch(`${this.baseUrl}/d/${id}`).then(it => it.arrayBuffer());

    const resourceStore = await ZipArchiveResourceStore.create(buffer);

    await resourceStore.loadAll();

    const beatmaps: Beatmap[] = [];

    for (const filename of resourceStore.getAvailableResources()) {
      if (filename.endsWith('.osu')) {
        const data = resourceStore.get(filename);
        if (!data)
          continue;

        try {
          const text = new TextDecoder().decode(data);

          const parsed = new StableBeatmapParser().parse(text);
          if (parsed.beatmapInfo.ruleset.available) {
            const beatmap = parsed.beatmapInfo.ruleset.createInstance().createBeatmapConverter(parsed as unknown as IBeatmap);

            beatmaps.push(beatmap.convert() as Beatmap<any>);
          }
        }
        catch (e) {
          console.error('Failed to load beatmap', filename, e);
        }
      }
    }

    return new WorkingBeatmapSet(
      beatmaps,
      new ResourceStoreBackedFileStore(resourceStore),
    );
  }

  lookupBeatmap(id: number): Promise<BeatmapResponse> {
    return fetch(`${this.baseUrl}/api/v2/b/${id}`).then(res => res.json());
  }

  async search(term: string, rankedOnly = false): Promise<BeatmapSetResponse[]> {
    let url = `${this.baseUrl}/api/v2/search?query=${encodeURIComponent(term)}&mode=0&limit=200`;

    if (rankedOnly)
      url += '&status=1';

    return await fetch(url).then(res => res.json());
  }
}

export interface BeatmapResponse {
  id: number;
  failed: null | number;
  exited: null | number;
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
  deleted_at: null | number;
  drain: number;
  hit_length: number;
  is_scoreable: boolean;
  mode_int: number;
  passcount: number;
  playcount: number;
  ranked: number;
  url: string;
  checksum: string;
  max_combo:
    | null
    | {
      [k: string]: unknown;
    }
    | number;
  last_updated: number;
  last_checked: number;
  set: {
    id: number;
    artist: string;
    artist_unicode: string;
    creator: string;
    source: string;
    tags: string;
    title: string;
    title_unicode: string;
    favourite_count: number;
    hype: null | {
      current: number;
      required: number;
      [k: string]: unknown;
    };
    nsfw: boolean;
    offset: number;
    play_count: number;
    spotlight: boolean;
    status: string;
    track_id: null | number;
    user_id: number;
    video: boolean;
    bpm: number;
    can_be_hyped: boolean;
    deleted_at: null | number;
    discussion_enabled: boolean;
    discussion_locked: boolean;
    is_scoreable: boolean;
    last_updated: number;
    legacy_thread_url: string;
    nominations_summary: {
      current: number;
      required: number;
      [k: string]: unknown;
    };
    ranked: number;
    ranked_date: number;
    storyboard: boolean;
    submitted_date: number;
    availability: {
      download_disabled: boolean;
      more_information: null | string;
      [k: string]: unknown;
    };
    has_favourited: boolean;
    beatmaps: {
      id: number;
      failed: null | number;
      exited: null | number;
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
      deleted_at: null | number;
      drain: number;
      hit_length: number;
      is_scoreable: boolean;
      mode_int: number;
      passcount: number;
      playcount: number;
      ranked: number;
      url: string;
      checksum: string;
      max_combo:
        | null
        | {
          [k: string]: unknown;
        }
        | number;
      last_updated: number;
      last_checked: number;
      [k: string]: unknown;
    }[];
    converts: {
      id: number;
      failed: null | number;
      exited: null | number;
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
      deleted_at: null | number;
      drain: number;
      hit_length: number;
      is_scoreable: boolean;
      mode_int: number;
      passcount: number;
      playcount: number;
      ranked: number;
      url: string;
      checksum: string;
      [k: string]: unknown;
    }[];
    current_nominations: {
      [k: string]: unknown;
    }[];
    description: {
      description: string;
      [k: string]: unknown;
    };
    genre: {
      id: number;
      name: string;
      [k: string]: unknown;
    };
    language: {
      id: number;
      name: string;
      [k: string]: unknown;
    };
    pack_tags: string[];
    ratings: number[];
    related_users: {
      id: number;
      username: string;
      country_code: string;
      [k: string]: unknown;
    }[];
    last_checked: number;
    rating: number;
    [k: string]: unknown;
  };
}
