/// <reference types="vite/client" />
/// <reference types="unplugin-pixi-assets/client" />

declare module '*.fnt' {
  const src: string;
  export default src;
}

declare module '*?texture' {
  const texture: import('pixi.js').Texture;
  export default texture;
}

declare module '*?bmFont' {
  const font: import('osucad-framework').FontDefinition;
  export default font;
}

declare module 'osu-db-parser' {
  class OsuDBParser {
    constructor(buffer: Buffer);
    getOsuDBData(): OsuDBParser.OsuDbData;
  }

  namespace OsuDBParser {

    interface OsuDbData {
      beatmaps: Beatmap[];
      beatmaps_count: number;
      date_unlock_ticks: number;
      folder_count: number;
      isLocked: boolean;
      is_unlocked: boolean;
      osuver: number;
      username: string;
      userperms: number;
    }

    interface Beatmap {
      artist_name: string;
      artist_name_unicode: string;
      song_title: string;
      song_title_unicode: string;
      creator_name: string;
      difficulty: string;
      audio_file_name: string;
      md5: string;
      osu_file_name: string;
      ranked_status: number;
      n_hitcircles: number;
      n_sliders: number;
      n_spinners: number;
      last_modification_time: number;
      approach_rate: number;
      circle_size: number;
      hp_drain: number;
      overall_difficulty: number;
      slider_velocity: number;
      star_rating_standard: StarRatingStandard;
      star_rating_taiko: StarRatingTaiko;
      star_rating_ctb: StarRatingCtb;
      star_rating_mania: StarRatingMania;
      drain_time: number;
      total_time: number;
      preview_offset: number;
      beatmap_id: number;
      beatmapset_id: number;
      thread_id: number;
      grade_standard: number;
      grade_taiko: number;
      grade_ctb: number;
      grade_mania: number;
      local_beatmap_offset: number;
      stack_leniency: number;
      timing_points: [number, number, boolean][];
      mode: number;
      song_source: string;
      song_tags: string;
      online_offset: number;
      title_font: string;
      unplayed: boolean;
      last_played: number;
      osz2: boolean;
      folder_name: string;
      last_checked_against_repository: number;
      ignore_sound: boolean;
      ignore_skin: boolean;
      disable_storyboard: boolean;
      disable_video: boolean;
      visual_override: boolean;
      last_modification_time_2: number;
      mania_scroll_speed: number;
    }

  }

  export = OsuDBParser;
}
