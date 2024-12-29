import { IBeatmapEntity, IBeatmapManager } from '../../types/IBeatmapManager';

export interface BeatmapManagerProxy extends IBeatmapManager {
  onUpdated(fn: (beatmaps: IBeatmapEntity[]) => void): void ;
  onDeleted(fn: (ids: string[]) => void): void ;
}

export function createBeatmapManagerProxy() {
  return new Proxy({}, {
    get(_: unknown, p: string | symbol): unknown {
      if (p === 'onUpdated') {
        return (fn: (beatmaps: IBeatmapEntity[]) => void) => {
          window.electron.ipcRenderer.on('beatmaps:updated', (_, beatmaps: IBeatmapEntity[]) => fn(beatmaps))
        }
      }

      if (p === 'onDeleted') {
        return (fn: (beatmaps: string[]) => void) => {
          window.electron.ipcRenderer.on('beatmaps:deleted', (_, ids: string[]) => fn(ids))
        }
      }

      if (typeof p === 'string') {
        return (...args: unknown[]) => window.electron.ipcRenderer.invoke(`beatmaps:${p}`, ...args);
      }
    },
  }) as BeatmapManagerProxy;
}
