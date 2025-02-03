import type { APIBeatmapSet } from '../APIBeatmapSet';
import { APIRequest } from './APIRequest';

export class GetBeatmapSetsRequest extends APIRequest<APIBeatmapSet[]> {
  constructor() {
    super('/beatmapsets/', 'GET', true);
  }
}
