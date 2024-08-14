import { EditorEnvironment } from '../EditorEnvironment';
import type { BeatmapStore } from '../BeatmapStore';
import { BrowserBeatmapStore } from './BrowserBeatmapStore';

export class BrowserEditorEnvironment extends EditorEnvironment {
  createBeatmapStore(): BeatmapStore {
    return new BrowserBeatmapStore();
  }
}
