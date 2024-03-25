import { getRecentBeatmaps } from '@/api/getRecentBeatmaps.ts';
import { getAuditEvents } from './getAuditEvents.ts';

export * from './getRecentBeatmaps';

export const api = {
  getRecentBeatmaps,
  getAuditEvents,
};
