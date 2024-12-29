import { DataSource, Repository } from 'typeorm';
import { BeatmapEntity } from './beatmap.entity';
import log from 'electron-log/main';
import fs from 'node:fs';
import { join } from 'path';
import { StableBeatmapParser } from '@osucad/common';
import crypto from 'node:crypto';
import { PromisePool } from '@supercharge/promise-pool';
import { getDataSource } from './datasource';
import { Worker, workerData } from 'worker_threads';
// @ts-expect-error importing a worker
import createWorker from './DiffcalcWorker?nodeWorker';

export class BeatmapManager {
  constructor(
    readonly dataSource: DataSource,
    readonly songDirectory: string | null,
  ) {
    this.beatmapRepository = dataSource.getRepository(BeatmapEntity);

    this.diffcalcWorker = createWorker();

    this.init();
  }

  async init() {
    this.diffcalcWorker.on('message', ({ id, starRating }) => {
      const cb = this.diffcalcCallbacks.get(id);
      if (cb) {
        this.diffcalcCallbacks.delete(id);
        cb(starRating);
      }
    });

    const beatmapsThatNeedDiffcalc = await this.beatmapRepository.find({
      select: ['id', 'osuFileName', 'folderName'],
      where: {
        needsStarRatingUpdate: true,
        unparseable: false,
      },
    });

    for (const beatmap of beatmapsThatNeedDiffcalc)
      this.requestDiffCalc(beatmap);
  }

  readonly diffcalcWorker: Worker;

  readonly beatmapRepository!: Repository<BeatmapEntity>;

  readonly diffcalcCallbacks = new Map<string, (starRating: number) => void>;

  async scanSongDirectory(calculateHashes = false) {
    const directory = this.songDirectory;
    if (!directory)
      return;

    this.diffcalcWorker.postMessage('pause');

    log.info('Scanning beatmap directory at', directory);

    log.info('Collecting beatmap files');
    const beatmapFiles = await Array.fromAsync(this.collectBeatmapFiles(directory));
    log.info(`Found ${beatmapFiles.length} beatmap files`);

    const beatmaps = await this.beatmapRepository.find({
      select: ['id', 'osuFileName', 'folderName', 'sha1'],
    });

    const beatmapLookup = new Map<string, BeatmapEntity>;

    log.info(`Found ${beatmaps.length} beatmaps in database`);

    for (const beatmap of beatmaps)
      beatmapLookup.set(join(beatmap.folderName, beatmap.osuFileName), beatmap);


    const flushPendingInserts = () => {
      if (this.pendingInserts.length === 0)
        return;

      const inserts = this.pendingInserts;
      this.pendingInserts = [];

      this.beatmapRepository.insert(inserts);
    };

    await PromisePool
      .withConcurrency(5)
      .for(beatmapFiles)
      .process(async entry => {
        const key = join(entry.mapsetDirectory, entry.osuFileName);

        const entity = beatmapLookup.get(key);

        if (entity)
          beatmapLookup.delete(key);

        await this.scanBeatmap(
          entry.path,
          entry.mapsetDirectory,
          entry.osuFileName,
          entity,
          calculateHashes,
        );

        if (this.pendingInserts.length > 50)
          flushPendingInserts();
      });

    flushPendingInserts();

    if (beatmapLookup.size > 0) {
      log.info(`Found ${beatmapLookup.size} beatmaps in database that no longer exist`);
      await this.beatmapRepository.delete([...beatmapLookup.values()].map(it => it.id));
    }

    this.diffcalcWorker.postMessage('resume');

    log.info('Finished scanning song directory');
  }

  getHash(path: string) {
    return new Promise<string>((resolve) => {
      const fd = fs.createReadStream(path);

      const hash = crypto.createHash('sha1');
      hash.setEncoding('hex');

      fd.on('end', () => {
        hash.end();
        resolve(hash.read());
      });

      fd.pipe(hash);
    });
  }

  pendingInserts: BeatmapEntity[] = [];

  async scanBeatmap(
    path: string,
    folderName: string,
    osuFileName: string,
    entity?: BeatmapEntity,
    calculateHash = false,
  ) {
    try {
      let sha1: string | undefined;
      if (calculateHash)
        sha1 = await this.getHash(path);

      if ((calculateHash && entity?.sha1 === sha1) || (!calculateHash && entity))
        return;

      sha1 ??= await this.getHash(path);

      try {
        const beatmap = await new StableBeatmapParser().parse(
          await fs.promises.readFile(path, 'utf8'),
          {
            timingPoints: false,
            hitObjects: false,
          });

        log.info(`Updating ${beatmap.metadata.artist} - ${beatmap.metadata.title} [${beatmap.metadata.difficultyName}]`);

        if (!entity) {
          entity = this.beatmapRepository.create({
            sha1: sha1,
            folderName,
            osuFileName,
            artist: beatmap.metadata.artist,
            artistUnicode: beatmap.metadata.artistUnicode,
            title: beatmap.metadata.title,
            titleUnicode: beatmap.metadata.titleUnicode,
            difficultyName: beatmap.metadata.difficultyName,
            tags: beatmap.metadata.tags,
            osuWebId: beatmap.metadata.osuWebId,
            osuWebMapsetId: beatmap.metadata.osuWebSetId,
            creatorName: beatmap.metadata.creator,
            previewTime: Math.round(beatmap.metadata.previewTime),
            backgroundFileName: beatmap.settings.backgroundFilename,
          });
          this.pendingInserts.push(entity);
        } else {
          await this.beatmapRepository.update({ id: entity.id }, {
            sha1,
            artist: beatmap.metadata.artist,
            artistUnicode: beatmap.metadata.artistUnicode,
            title: beatmap.metadata.title,
            titleUnicode: beatmap.metadata.titleUnicode,
            difficultyName: beatmap.metadata.difficultyName,
            tags: beatmap.metadata.tags,
            osuWebId: beatmap.metadata.osuWebId,
            osuWebMapsetId: beatmap.metadata.osuWebSetId,
            creatorName: beatmap.metadata.creator,
            previewTime: Math.round(beatmap.metadata.previewTime),
            backgroundFileName: beatmap.settings.backgroundFilename,
            starRating: 0,
            needsStarRatingUpdate: true,
          });
          this.requestDiffCalc(entity);
        }
      } catch (e) {
        if (entity) {
          await this.beatmapRepository.update({ id: entity.id }, { unparseable: true });
        } else {
          entity = this.beatmapRepository.create({
            unparseable: true,
            folderName,
            osuFileName,
            sha1,
            artist: '',
            artistUnicode: '',
            title: '',
            titleUnicode: '',
            difficultyName: '',
            tags: '',
            osuWebId: 0,
            osuWebMapsetId: 0,
            creatorName: '',
            previewTime: 0,
            backgroundFileName: null,
            needsStarRatingUpdate: false,
            starRating: 0,
            osucadFileName: null,
          });
        }

        this.pendingInserts.push(entity);

        log.error('Failed to parse beatmap', osuFileName, e);
      }
    } catch (e) {
      log.error('Failed to load beatmap', osuFileName, e);
    }
  }

  async* collectBeatmapFiles(directory: string) {
    try {
      const songDirEntries = await fs.promises.opendir(directory);

      for await (const mapsetEntry of songDirEntries) {
        if (mapsetEntry.isDirectory()) {
          for await (const entry of await fs.promises.opendir(join(directory, mapsetEntry.name))) {
            if (entry.isFile() && entry.name.endsWith('.osu'))
              yield {
                path: join(directory, mapsetEntry.name, entry.name),
                mapsetDirectory: mapsetEntry.name,
                osuFileName: entry.name,
              };
          }
        }
      }
    } catch (e) {
      log.error('Failed to scan beatmap directory', e);
    }
  }

  requestDiffCalc(beatmap: BeatmapEntity) {
    if (this.diffcalcCallbacks.has(beatmap.id))
      return;

    if (!this.songDirectory)
      return;

    this.diffcalcCallbacks.set(beatmap.id, starRating =>
      this.beatmapRepository.update({ id: beatmap.id }, {
        starRating,
        needsStarRatingUpdate: false,
      }),
    );

    this.diffcalcWorker.postMessage({
      id: beatmap.id,
      path: join(this.songDirectory, beatmap.folderName, beatmap.osuFileName),
    });
  }

  getBeatmaps() {
    return this.beatmapRepository.find({
      where: {
        unparseable: false,
      },
    });
  }
}

const beatmapManager = getDataSource().then(datasource => new BeatmapManager(datasource, workerData.songDirectory));

export async function getBeatmapManager() {
  return beatmapManager;
}
