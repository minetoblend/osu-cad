import { Inject, Scope } from '@nestjs/common';
import { JOB_REF, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as unzipper from 'unzipper';
import * as fs from 'fs';
import { UserService } from '../../users/user.service';
import { AssetQuotaService } from '../../assets/asset-quota.service';
import { tmpdir } from 'node:os';
import { join, resolve } from 'path';
import { BeatmapDecoder } from 'osu-parsers';
import { BeatmapEntity } from '../beatmap.entity';
import { MapsetEntity } from '../mapset.entity';
import { AssetEntity } from '../../assets/asset.entity';
import { StandardRuleset } from 'osu-standard-stable';
import { BeatmapConverter } from './beatmap-converter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssetsService } from '../../assets/assets.service';
import { BeatmapService } from '../beatmap.service';
import { Beatmap } from '@osucad/common';
import { BeatmapSnapshotService } from '../beatmap-snapshot.service';
import { BeatmapImportProgress } from '@osucad/common';
import { ImagesService } from '../../assets/images.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from '../../audit/audit.service';
import { MapsetService } from '../mapset.service';

export interface BeatmapImportJob {
  userId: number;
  path: string;
}

export const BeatmapImportProgressEvent = 'beatmap-import-progress';

export interface ZipEntry {
  type: 'asset' | 'beatmap';
  path: string;
}

@Processor({
  name: 'beatmap-import',
  scope: Scope.REQUEST,
})
export class BeatmapImportProcessor {
  static queueName = 'beatmap-import';

  constructor(
    @Inject(JOB_REF)
    private readonly job: Job<BeatmapImportJob>,
    private readonly userService: UserService,
    private readonly assetsService: AssetsService,
    private readonly beatmapService: BeatmapService,
    private readonly mapsetService: MapsetService,
    private readonly beatmapSnapshotService: BeatmapSnapshotService,
    private readonly assetQuotaService: AssetQuotaService,
    private readonly imagesService: ImagesService,
    private readonly auditService: AuditService,
    @InjectRepository(BeatmapEntity)
    private readonly beatmapRepository: Repository<BeatmapEntity>,
    @InjectRepository(MapsetEntity)
    private readonly mapsetRepository: Repository<MapsetEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private directory!: string;
  private readonly mapset = new MapsetEntity();
  private readonly beatmaps: { entity: BeatmapEntity; beatmap: Beatmap }[] = [];
  private readonly assets: AssetEntity[] = [];
  private readonly s3Assets: AssetEntity[] = [];

  private initializedMapset = false;

  @Process({ concurrency: 5 })
  async process() {
    try {
      await this.importMapsetArchive();
      await this.cleanup();
    } catch (e) {
      console.error('Failed to import beatmap', e);
      console.error(e.stack);
      await this.cleanup(true);
      await this.reportProgress({
        status: 'error',
      });
      return {
        error: 'Failed to import beatmap',
        message: e.message,
      };
    }
  }

  async importMapsetArchive() {
    await this.reportProgress({ status: 'initializing' });

    this.directory = await fs.promises.mkdtemp(
      join(tmpdir(), 'beatmap-import-'),
    );

    const { userId, path } = this.job.data;
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    this.mapset.creator = user;

    const quota = await this.assetQuotaService.getQuotaInfo(userId);

    console.log({ quota });

    const maxFileSize = Math.min(100_000_000, quota.remaining);

    await this.reportProgress({ status: 'analyzing-archive' });

    const { entries } = await this.loadZipFile(path, maxFileSize);

    await fs.promises.rm(path);

    const beatmapEntries = entries.filter((entry) => entry.type === 'beatmap');

    for (const entry of beatmapEntries) {
      await this.reportProgress({
        status: 'importing-beatmaps',
        total: beatmapEntries.length,
        current: entry.path,
        finished: this.beatmaps.length,
      });

      await this.importBeatmap(entry.path);
    }

    this.mapset.beatmaps = this.beatmaps.map((b) => b.entity);

    await this.mapsetService.create(this.mapset);

    for (const { entity, beatmap } of this.beatmaps) {
      await this.beatmapSnapshotService.createSnapshotFromBeatmap(
        entity,
        beatmap,
      );
    }

    const assetEntries = entries.filter((entry) => entry.type === 'asset');
    for (const entry of assetEntries) {
      await this.reportProgress({
        status: 'importing-assets',
        total: assetEntries.length,
        current: entry.path,
        finished: this.assets.length,
      });

      await this.importAsset(entry.path);
    }

    let thumbnailCount = 0;
    for (const { entity, beatmap } of this.beatmaps) {
      await this.reportProgress({
        status: 'generating-thumbnails',
        total: this.beatmaps.length,
        current: entity.name,
        finished: thumbnailCount++,
      });
      await this.generateThumbnail(entity, beatmap);
    }

    await this.reportProgress({ status: 'done', mapsetId: this.mapset.id });
    await this.auditService.record(user, 'mapset.import', {
      mapsetId: this.mapset.id,
      title: `${this.mapset.artist} - ${this.mapset.title}`,
    });
  }

  private async importBeatmap(path: string) {
    const decoder = new BeatmapDecoder();
    const beatmap = await decoder.decodeFromPath(join(this.directory, path));
    if (beatmap.mode !== 0) {
      await this.job.log(
        `Found non-standard beatmap [${beatmap.metadata.version}], skipping...`,
      );
      return;
    }

    const ruleset = new StandardRuleset();
    const standardBeatmap = ruleset.applyToBeatmap(beatmap);

    const converter = new BeatmapConverter(standardBeatmap);

    const converted = converter.convert();

    const entity = new BeatmapEntity();
    entity.name = converted.name;
    entity.osuId = beatmap.metadata.beatmapId;
    entity.starRating = 0;
    entity.mapset = this.mapset;
    entity.needsThumbnail = true;

    if (!this.initializedMapset) {
      this.initializedMapset = true;

      if (beatmap.metadata.beatmapSetId !== -1)
        this.mapset.osuId = beatmap.metadata.beatmapSetId;
      this.mapset.title = beatmap.metadata.title;
      this.mapset.artist = beatmap.metadata.artist;
      this.mapset.tags = beatmap.metadata.tags;
      this.mapset.s3Storage = true;
    }

    this.beatmaps.push({ entity, beatmap: converted });
  }

  private async loadZipFile(path: string, maxFileSize = 100_000_000) {
    let remainingFileSize = maxFileSize;

    const zip = fs.createReadStream(path).pipe(
      unzipper.Parse({
        forceStream: true,
      }),
    );

    const entries: ZipEntry[] = [];

    const allowedFileTypes = [
      'osu',
      'mp3',
      'ogg',
      'wav',
      'jpg',
      'jpeg',
      'png',
      'osb',
      'mp4',
    ];

    for await (const entry of zip) {
      const zipEntry = entry as unzipper.Entry;

      zipEntry.path = zipEntry.path.replaceAll(/[*,?"<>|~]+/g, '_');

      // @ts-expect-error The types are lying, this property exists
      remainingFileSize -= zipEntry.vars.uncompressedSize;

      if (remainingFileSize < 0) {
        await zipEntry.autodrain().promise();

        throw new Error('File too large');
      }

      const fileType = zipEntry.path.split('.').pop() ?? '';

      if (!allowedFileTypes.includes(fileType)) {
        await zipEntry.autodrain().promise();
        continue;
      }

      if (fileType === 'osu') {
        entries.push({ type: 'beatmap', path: zipEntry.path });
      } else {
        entries.push({ type: 'asset', path: zipEntry.path });
      }

      const parent = resolve(this.directory, zipEntry.path, '..');
      await fs.promises
        .mkdir(parent, { recursive: true })
        .catch((e) => console.error('Failed to create directory', parent, e));

      await new Promise((resolve, reject) => {
        zipEntry
          .pipe(fs.createWriteStream(join(this.directory, zipEntry.path)))
          .on('finish', resolve)
          .on('error', reject);
      });
    }

    return { entries };
  }

  private async cleanup(error: boolean = false) {
    if (error) {
      for (const asset of this.assets) {
        try {
          await this.assetsService.returnAsset(asset);
        } catch (e) {
          console.error('Failed to return asset', e);
        }
      }
      for (const beatmap of this.beatmaps) {
        if (beatmap.entity.id) {
          try {
            await this.beatmapRepository.delete(beatmap.entity.id);
          } catch (e) {
            console.error('Failed to delete beatmap', e);
          }
        }
      }

      if (this.mapset.id) {
        try {
          await this.mapsetRepository.delete(this.mapset.id);
        } catch (e) {
          console.error('Failed to delete mapset', e);
        }
      }
    }

    try {
      if (this.directory) {
        await fs.promises.rm(this.directory, { recursive: true, force: true });
      }
    } catch (e) {
      console.error('Failed to cleanup directory', this.directory, e);
    }
  }

  private async reportProgress(progress: BeatmapImportProgress) {
    await this.job.log(JSON.stringify(progress));
    this.eventEmitter.emit(
      BeatmapImportProgressEvent,
      this.job.data.userId,
      progress,
    );
  }

  private async importAsset(path: string) {
    const buffer = await fs.promises.readFile(join(this.directory, path));

    const asset = await this.assetsService.addAssetToMapset({
      mapset: this.mapset,
      buffer,
      path,
    });

    this.assets.push(asset);
  }

  private async generateThumbnail(entity: BeatmapEntity, beatmap: Beatmap) {
    try {
      const path = beatmap.backgroundPath;
      const asset = this.assets.find((a) => a.path === path);
      if (!asset) {
        return;
      }

      const id = 'beatmaps/thumbnails/' + entity.uuid.toString();

      const { success, result } = await this.imagesService.uploadImage(
        id,
        path,
        await fs.promises.readFile(join(this.directory, path)),
        {
          type: 'beatmap-thumbnail',
          beatmapId: entity.id.toString(),
        },
      );

      await this.beatmapRepository.update(
        { id: entity.id },
        {
          thumbnailId: result.id,
        },
      );

      if (success) {
        entity.thumbnailId = result.id;
      }
    } catch (e) {
      await this.job.log(
        `Error: Failed to generate thumbnail for beatmap ${entity.name}`,
      );
    }
  }
}
