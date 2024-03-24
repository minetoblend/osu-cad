export type BeatmapImportProgress =
  | {
      status: 'initializing';
    }
  | {
      status: 'analyzing-archive';
    }
  | {
      status: 'importing-beatmaps';
      total: number;
      finished: number;
      current: string;
    }
  | {
      status: 'importing-assets';
      total: number;
      finished: number;
      current: string;
    }
  | {
      status: 'generating-thumbnails';
      total: number;
      finished: number;
      current: string;
    }
  | {
      status: 'done';
      mapsetId: string;
    }
  | {
      status: 'error';
      message?: string;
    };
