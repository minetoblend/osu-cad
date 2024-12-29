import { OsuStableInfo } from '../loadOsuStableInfo';
import { getDataSource } from './datasource';
import { BeatmapManager } from './BeatmapManager';
import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
// @ts-expect-error importing a worker
import createScanWorker from './BeatmapScanWorker?nodeWorker';
// @ts-expect-error importing a worker
import createDiffcalcWorker from './DiffcalcWorker?nodeWorker';
import { join } from 'path';
import { Worker } from 'worker_threads';

export async function setupDatabase(stableInfo: OsuStableInfo | null, window: BrowserWindow) {
  const datasource = await getDataSource();

  const beatmapManager = new BeatmapManager(datasource, stableInfo);

  const registerHandler = (id: string, handler: (event: IpcMainInvokeEvent, ...args: any[]) => (Promise<any>)) =>
    ipcMain.handle(`beatmaps:${id}`, handler);

  const pendingUpdates = new Set<string>();
  const pendingDeletions = new Set<string>();

  let importFinished = false

  ipcMain.handle('beatmaps:isImporting', async () => {
    return !importFinished
  })

  if (stableInfo?.songsPath) {
    const scanWorker: Worker = createScanWorker({
      workerData: {
        database: join(app.getPath('userData'), 'osucad.db'),
        songDirectory: stableInfo.songsPath,
      },
    });
    const diffcalcWorker: Worker = createDiffcalcWorker({
      workerData: {
        database: join(app.getPath('userData'), 'osucad.db'),
        songDirectory: stableInfo.songsPath,
      },
    });

    const handleMessage = ([event, ids]: ['updated' | 'deleted', string[]]) => {
      if (event === 'updated') {
        for (const id of ids)
          pendingUpdates.add(id);

      } else if (event === 'deleted') {
        for (const id of ids)
          pendingDeletions.add(id);
      }
    };

    scanWorker.on('message', handleMessage);
    diffcalcWorker.on('message', handleMessage);

    scanWorker.on('message', ([message]) => {
      if (message === 'done') {
        importFinished = true;
        window.webContents.send('beatmaps:importFinished')
      }
    })
  }

  registerHandler('getAll', () => beatmapManager.getAll());
  registerHandler('saveBeatmap', (_, id, osuFileContent) => beatmapManager.saveBeatmap(id, osuFileContent));

  beatmapManager.updated.addListener(ids => {
    for (const id of ids)
      pendingUpdates.add(id)
  })

  const flush = async () => {
    const didUpdate = pendingUpdates.size > 0 || pendingDeletions.size > 0

    if (pendingUpdates.size > 0) {
      const ids = [...pendingUpdates]
      pendingUpdates.clear()

      window.webContents.send('beatmaps:updated', await beatmapManager.getBeatmaps(ids))
    }

    if (pendingDeletions.size > 0) {
      const ids = [...pendingDeletions]
      pendingDeletions.clear()

      window.webContents.send('beatmaps:deleted', ids)
    }

    setTimeout(flush, didUpdate ? 5 : 20);
  }

  flush()
}


