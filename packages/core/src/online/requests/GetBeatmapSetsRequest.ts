import { APIRequest } from "./APIRequest";
import { APIBeatmapSet } from "../APIBeatmapSet";

export class GetBeatmapSetsRequest extends APIRequest<APIBeatmapSet[]> {
  constructor() {
    super('/beatmapsets/')
  }
}