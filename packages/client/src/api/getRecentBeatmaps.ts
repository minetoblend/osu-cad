import { useAxios } from '@/composables/useAxios.ts';
import { BeatmapInfo } from '@osucad/common';

export interface GetRecentBeatmapsOptions {
  filter: 'own' | 'shared-with-me' | 'all';
  sort: 'artist' | 'title' | 'recent';
  search: string;
}
export async function getRecentBeatmaps({
  filter,
  sort,
  search,
}: GetRecentBeatmapsOptions): Promise<BeatmapInfo[]> {
  const response = await useAxios().get<BeatmapInfo[]>('/api/beatmaps', {
    params: { filter, sort, search },
    withCredentials: true,
  });

  return response.data;
}
