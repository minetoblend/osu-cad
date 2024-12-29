/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { parentPort, workerData } from 'worker_threads';
import { StableBeatmapParser } from '@osucad/common';
import fs from 'node:fs/promises';
import { OsuDifficultyCalculator } from '../../../../editor/src/difficulty/OsuDifficultyCalculator';
import { PromisePool } from '@supercharge/promise-pool';
import { getDataSource } from './datasource';
import { BeatmapEntity } from './beatmap.entity';
import { join } from 'path';
import { Repository } from 'typeorm';

const port = parentPort;
if (!port) throw new Error('IllegalState');

run();

async function run() {
  const songDirectory = workerData.songDirectory;

  const datasource = await getDataSource();

  const repository = datasource.getRepository(BeatmapEntity);


  await PromisePool
    .withConcurrency(5)
    .for(getEntitiesToProcess(repository))
    .process(async (entity) => {
      const path = join(songDirectory, entity.folderName, entity.osuFileName);

      const starRating = await calculateStarRating(path);

      await repository.update({ id: entity.id }, {
        starRating,
        needsStarRatingUpdate: false,
        diffcalcInProgress: false,
      });

      port!.postMessage(['updated', [entity.id]]);
    });
}

async function* getEntitiesToProcess(repository: Repository<BeatmapEntity>) {
  while (true) {

    const entities = await repository.find({
      where: {
        needsStarRatingUpdate: true,
        unparseable: false,
        diffcalcInProgress: false,
      },
      take: 20,
    });

    if (entities.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 2500));
      continue;
    }

    await repository.update(entities.map(it => it.id), {
      diffcalcInProgress: true,
    });


    yield* entities;


  }
}


const parser = new StableBeatmapParser();


async function calculateStarRating(path: string) {
  try {
    const beatmap = await parser.parse(await fs.readFile(path, 'utf8'));

    const [difficulty] = new OsuDifficultyCalculator(beatmap).calculate();

    console.log(`Calculated star rating for ${beatmap.metadata.artist} - ${beatmap.metadata.title} [${beatmap.metadata.difficultyName}]: ${difficulty.starRating}`);

    return difficulty.starRating;
  } catch (e) {
    console.error(e);
    return 0;
  }
}
