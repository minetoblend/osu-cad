import type { IResourceStore } from "../io/stores/IResourceStore";
import type { Sample } from "./Sample";

export interface ISampleStore extends IResourceStore<Sample>
{
  addExtension: (extension: string) => void;
}
