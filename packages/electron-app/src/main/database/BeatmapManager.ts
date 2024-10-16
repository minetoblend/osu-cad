import { DataSource, In, Repository } from 'typeorm';
import { BeatmapEntity } from './beatmap.entity';
import { OsuStableInfo } from '../loadOsuStableInfo';
import { Action, StableBeatmapParser } from '@osucad/editor';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { join } from 'path';
import log from 'electron-log/main';
import { Beatmap } from '@osucad/editor';
import { OsuDifficultyCalculator } from '../../../../editor/src/difficulty/OsuDifficultyCalculator';
import { IBeatmapManager } from '../../types/IBeatmapManager';

export class BeatmapManager implements IBeatmapManager {
  constructor(
    readonly dataSource: DataSource,
    readonly stableInfo: OsuStableInfo | null,
  ) {
    this.beatmapRepository = dataSource.getRepository(BeatmapEntity);
  }

  private readonly beatmapRepository!: Repository<BeatmapEntity>;

  getAll() {
    return this.beatmapRepository.find({
      where: {
        unparseable: false,
      },
    });
  }

  getBeatmaps(ids: string[]) {
    return this.beatmapRepository.findBy({
      id: In(ids),
    });
  }

  get songDirectory() {
    return this.stableInfo?.songsPath ?? null;
  }

  getHash(data: string) {
    return crypto
      .createHash('sha1')
      .update(data, 'utf8')
      .digest('hex');
  }

  #lastBackupTime = new Map<string, number>();

  async saveBeatmap(
    id: string,
    osuFileContent: string,
  ): Promise<boolean> {
    try {
      log.info('Saving beatmap', id);

      const beatmap = await new StableBeatmapParser().parse(osuFileContent);

      const entity = await this.beatmapRepository.findOneBy({ id });

      if (!entity) {
        log.error('No entity found when saving beatmap', beatmap.metadata.displayName)
        // TODO: implement adding new difficulties
        return false;
      }

      const filename = `${
        beatmap.metadata.artist || beatmap.metadata.artistUnicode
      } - ${
        beatmap.metadata.title || beatmap.metadata.titleUnicode
      } (${beatmap.metadata.creator}) [${beatmap.metadata.difficultyName}].osu`;

      if (filename !== entity.osuFileName) {
        log.info(`Name of .osu file changed from "${entity.osuFileName}" to "${filename}"`);
      }

      const mapsetDirectory = join(this.songDirectory!, entity.folderName);

      const lastBackupTime = this.#lastBackupTime.get(id);

      if (!lastBackupTime || new Date().getTime() - lastBackupTime > 60_000) {
        log.info('Creating backup')

        this.#lastBackupTime.set(id, new Date().getTime());
        try {
          const backupDirectory = join(mapsetDirectory, '.osucad/backups');

          await fs.mkdir(backupDirectory, { recursive: true });

          await fs.writeFile(
            join(backupDirectory, `${new Date().getTime()}_${entity.osuFileName}.backup`),
            await fs.readFile(join(mapsetDirectory, entity.osuFileName), 'utf8'),
          );
        } catch (e) {
          log.error('Failed to create backup for', beatmap.metadata.displayName, e);
        }
      }

      const path = join(mapsetDirectory, entity.osuFileName);

      await fs.writeFile(path, osuFileContent);

      const stats = await fs.stat(path);

      await this.beatmapRepository.update(entity.id, {
        sha1: this.getHash(osuFileContent),
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
        starRating: this.calculateStarRating(beatmap),
        needsStarRatingUpdate: false,
        lastModifiedDate: stats.mtime.getTime(),
      });

      this.updated.emit([id])

      log.info(`Saved beatmap ${beatmap.metadata.displayName}`);

      return true;
    } catch(e) {
      log.error('Error when saving beatmap', id, e);

      return false;
    }
  }

  calculateStarRating(beatmap: Beatmap) {
    try {
      const [{ starRating }] = new OsuDifficultyCalculator(beatmap).calculate();

      return starRating;
    } catch(e) {
      log.error('Failed to calculate star rating for', beatmap.metadata.displayName, e)
      return 0
    }
  }

  updated = new Action<[string]>()
}
