import { parentPort, workerData } from 'worker_threads';
import { getDataSource } from './datasource';
import { BeatmapEntity } from './beatmap.entity';
import fs from 'node:fs';
import { join } from 'path';
import { PromisePool } from '@supercharge/promise-pool';
import { readFile } from 'node:fs/promises';
import crypto from 'node:crypto';
import { StableBeatmapParser } from '../../../../editor/src';

const port = parentPort;
if (!port) throw new Error('IllegalState');

async function run() {
  const songDirectory = workerData.songDirectory;

  const datasource = await getDataSource();

  const repository = datasource.getRepository(BeatmapEntity);

  const files = collectBeatmapFiles(songDirectory);

  const hashEntities = await repository.find({
    select: ['id', 'sha1', 'folderName', 'osuFileName', 'lastModifiedDate'],
  });

  const getKey = (folderName: string, fileName: string) => `${folderName}/${fileName}`;

  const beatmapHashes = new Map<string, BeatmapEntity>();

  for (const entity of hashEntities)
    beatmapHashes.set(getKey(entity.folderName, entity.osuFileName), entity);

  let pendingInserts: BeatmapEntity[] = [];

  const flushPendingInserts = async () => {
    if (pendingInserts.length === 0)
      return

    const inserts = pendingInserts
    pendingInserts = []

    await repository.insert(inserts)

    port!.postMessage(['updated', inserts.map(it => it.id)])
  }

  if (hashEntities.length > 0) {
    // we have previously run the importer before so we are emitting the done event early and continue running in the background
    port!.postMessage(['done']);
  }

  await PromisePool
    .withConcurrency(5)
    .for(files)
    .process(async (entry, index) => {
      const key = getKey(entry.mapsetDirectory, entry.osuFileName);

      const entity = beatmapHashes.get(key);

      if (entity)
        beatmapHashes.delete(key);

      await processBeatmap(
        entry.path,
        entry.osuFileName,
        entry.mapsetDirectory,
        entity,
      );
      if (index % 50 === 0)
        await flushPendingInserts()
    });

  await flushPendingInserts()

  if (beatmapHashes.size > 0) {
    const ids = [...beatmapHashes.values()].map(it => it.id)

    await repository.delete(ids);
    port!.postMessage(['deleted', ids]);
  }

  port!.postMessage(['done'])

  async function processBeatmap(
    path: string,
    osuFileName: string,
    folderName: string,
    entity?: BeatmapEntity
  ) {
    try {
      const stats = await fs.promises.stat(path)

      const lastModifiedDate = stats.mtime.getTime()

      if (lastModifiedDate === entity?.lastModifiedDate)
        return;

      const fileContent = await readFile(path, 'utf8');

      const sha1 = getHash(fileContent)

      if (entity?.sha1 === sha1)
        return;

      console.log(osuFileName)

      try {
        const beatmap = await new StableBeatmapParser().parse(fileContent, {
          timingPoints: false,
          hitObjects: false,
        })

        if (!entity) {
          entity = repository.create({
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
            audioFileName: beatmap.settings.audioFileName,
            lastModifiedDate,
          });
          pendingInserts.push(entity)
        } else {
          await repository.update({ id: entity.id }, {
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
            audioFileName: beatmap.settings.audioFileName,
            starRating: 0,
            needsStarRatingUpdate: true,
            lastModifiedDate,
          });
          port!.postMessage(['updated', [entity.id]]);
        }
      } catch(e) {
        if (entity)
          await repository.update({ id: entity.id }, { unparseable: true })
        else
          await repository.insert({
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
          })
      }
    } catch (e) {
      // noop
    }
  }

}

function getHash(content: string) {
  return crypto.createHash('sha1')
    .update(content, 'utf8')
    .digest('hex')
}

async function* collectBeatmapFiles(directory: string) {
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
    console.error('Failed to scan beatmap directory', e);
  }
}


run();
