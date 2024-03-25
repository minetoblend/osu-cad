export interface AuditEvents {
  login: object;
  logout: object;
  importMapset: {
    mapsetId: string;
    title: string;
  };
  joinRoom: {
    beatmapId: string;
    mapsetId: string;
    title: string;
    access: number;
  };
  leaveRoom: {
    beatmapId: string;
    mapsetId: string;
    title: string;
  };
  deleteBeatmap: {
    beatmapId: string;
    mapsetId: string;
    title: string;
  };
}
