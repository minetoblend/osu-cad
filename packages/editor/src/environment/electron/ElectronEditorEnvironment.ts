import { EditorEnvironment } from '../EditorEnvironment';
import type { BeatmapStore } from '../BeatmapStore';
import { ElectronBeatmapStore } from './ElectronBeatmapStore';

export class ElectronEditorEnvironment extends EditorEnvironment {
  createBeatmapStore(): BeatmapStore {
    return new ElectronBeatmapStore();
  }
}
