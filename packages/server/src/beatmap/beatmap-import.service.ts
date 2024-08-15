import { Injectable } from '@nestjs/common';
import { BeatmapService } from './beatmap.service';
import { UserEntity } from '../users/user.entity';
import { UserService } from '../users/user.service';
import * as unzipper from 'unzipper';
import { Readable } from 'stream';
import * as fs from 'fs/promises';
import { resolve } from 'path';
import { v4 as uuid } from 'uuid';
import { MapsetEntity } from './mapset.entity';
import { BeatmapDecoder } from 'osu-parsers';
import { Beatmap, HitSample, PathPoint as OsuPathPoint } from 'osu-classes';
import {
  Circle,
  Slider,
  Spinner,
  StandardBeatmap,
  StandardHitObject,
  StandardRuleset,
} from 'osu-standard-stable';
import { BeatmapEntity } from './beatmap.entity';
import {
  Additions,
  BeatmapData,
  defaultHitSound,
  defaultHitSoundLayers,
  hitObjectId,
  HitSound,
  HitSoundLayer,
  HitSoundManager,
  HitSoundSample,
  PathType,
  SampleSet,
  SampleType,
  SerializedEditorBookmark,
  SerializedHitObject,
  SerializedTimingPoint,
  SerializedVelocityPoint,
  PathPoint,
} from '@osucad/common';
import { Vec2 } from 'osucad-framework';
import { AssetsService } from '../assets/assets.service';
import { BeatmapSnapshotService } from './beatmap-snapshot.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BeatmapMigrator } from './beatmap-migrator';
import { MapsetService } from './mapset.service';

@Injectable()
export class BeatmapImportService {
  constructor(
    private readonly beatmapService: BeatmapService,
    private readonly userService: UserService,
    private readonly assetsService: AssetsService,
    private readonly snapshotService: BeatmapSnapshotService,
    private readonly mapsetService: MapsetService,
    @InjectRepository(BeatmapEntity)
    private readonly beatmapRepository: Repository<BeatmapEntity>,
  ) {}

  private readonly ruleset = new StandardRuleset();

  async mapsetPath(id: string) {
    const path = resolve('files/mapsets', id);
    await fs.mkdir(path, { recursive: true });
    return path;
  }

  async importOsz(
    buffer: Buffer,
    userId: number,
  ): Promise<MapsetEntity | null> {
    const user = await this.userService.findById(userId);
    if (!user) throw new Error('User not found');

    const id = uuid();

    const path = await this.mapsetPath(id);

    let mapset: MapsetEntity | undefined;

    const zip = Readable.from(buffer).pipe(
      unzipper.Parse({ forceStream: true }),
    );

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

    const assetPaths: string[] = [];

    const snapshots = new Map<string, BeatmapData>();

    for await (const entry of zip) {
      try {
        const fileType = entry.path.split('.').pop() ?? '';
        if (!allowedFileTypes.includes(fileType)) continue;

        if (entry.path.endsWith('.osu')) {
          const parsed = new BeatmapDecoder().decodeFromBuffer(
            await entry.buffer(),
          );
          if (parsed.mode !== 0) continue;

          const osuBeatmap = this.ruleset.applyToBeatmap(parsed);

          if (!mapset) mapset = this.createMapsetFromBeatmap(parsed, id, user);

          const { beatmap, data } =
            this.createDifficultyFromBeatmap(osuBeatmap);

          mapset.beatmaps.push(beatmap);
          snapshots.set(beatmap.name, data);

          continue;
        }
        const dir = resolve(path, entry.path, '..');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(resolve(path, entry.path), await entry.buffer());

        let assetPath = entry.path;
        if (assetPath.startsWith('/')) {
          assetPath = assetPath.slice(1);
        }

        assetPaths.push(assetPath);
      } catch (e) {
        console.error(e);
        await fs.rmdir(path);
        return null;
      }
    }

    if (!mapset) return null;

    await this.mapsetService.create(mapset);

    for (const assetPath of assetPaths) {
      const assetBuffer = await fs.readFile(resolve(path, assetPath));
      await this.assetsService.addAssetToMapset({
        mapset,
        buffer: assetBuffer,
        path: assetPath,
      });
    }

    for (const beatmap of mapset.beatmaps) {
      const data = snapshots.get(beatmap.name);
      if (!data) continue;

      const snapshot = await this.snapshotService.createSnapshot(beatmap, data);

      if (
        snapshot.data.backgroundPath &&
        assetPaths.includes(snapshot.data.backgroundPath)
      ) {
        const asset = await this.assetsService.getAsset(
          mapset,
          snapshot.data.backgroundPath,
        );

        if (asset) {
          await this.assetsService.increaseRefCount(asset.asset, 2);

          await this.beatmapRepository.update(
            {
              id: beatmap.id,
            },
            {
              thumbnailSmall: asset.asset,
              thumbnailLarge: asset.asset,
            },
          );
        }
      }

      await this.beatmapService.queueThumbnailJob(beatmap);
    }

    mapset.s3Storage = true;

    await this.mapsetService.save(mapset);

    await fs.rm(path, { recursive: true, force: true });

    return mapset;
  }

  private createMapsetFromBeatmap(
    parsed: Beatmap,
    id: string,
    user: UserEntity,
  ) {
    const mapset = new MapsetEntity();
    mapset.id = id;
    mapset.title = parsed.metadata.title;
    mapset.artist = parsed.metadata.artist;
    mapset.tags = parsed.metadata.tags;
    mapset.creator = user;
    mapset.osuId =
      parsed.metadata.beatmapSetId > 0 ? parsed.metadata.beatmapSetId : null;
    mapset.beatmaps = [];
    if (parsed.events.backgroundPath) {
      mapset.background = parsed.events.backgroundPath;
    }
    return mapset;
  }

  private createDifficultyFromBeatmap(imported: StandardBeatmap) {
    const entity = new BeatmapEntity();
    entity.name = imported.metadata.version;
    const difficultyCalculator =
      this.ruleset.createDifficultyCalculator(imported);
    entity.starRating = difficultyCalculator.calculate().starRating;
    entity.osuId =
      imported.metadata.beatmapId > 0 ? imported.metadata.beatmapId : null;

    const hitObjects: SerializedHitObject[] = [];
    const timing: SerializedTimingPoint[] = [];
    const velocity: SerializedVelocityPoint[] = [];

    const hitSounds = new HitSoundManager({
      layers: defaultHitSoundLayers(),
    });

    for (const hitObject of imported.hitObjects) {
      const hitSound = this.getHitSound(hitObject);

      if (hitObject instanceof Circle) {
        hitObjects.push({
          type: 'circle',
          startTime: hitObject.startTime,
          position: {
            x: hitObject.startPosition.x,
            y: hitObject.startPosition.y,
          },
          newCombo: hitObject.isNewCombo,
          comboOffset: hitObject.comboOffset,
          hitSound,
        });
      } else if (hitObject instanceof Slider) {
        hitObjects.push({
          type: 'slider',
          startTime: hitObject.startTime,
          position: {
            x: hitObject.startPosition.x,
            y: hitObject.startPosition.y,
          },
          newCombo: hitObject.isNewCombo,
          path: hitObject.path.controlPoints.map(this.convertPathPoint),
          expectedDistance: hitObject.path.expectedDistance,
          repeats: hitObject.repeats,
          comboOffset: hitObject.comboOffset,
          velocity: null,
          hitSound,
          hitSounds: hitObject.nodeSamples.map((s) => this.toHitSound(s)),
        });
      } else if (hitObject instanceof Spinner) {
        {
          hitObjects.push({
            type: 'spinner',
            startTime: hitObject.startTime,
            position: {
              x: hitObject.startPosition.x,
              y: hitObject.startPosition.y,
            },
            newCombo: hitObject.isNewCombo,
            duration: hitObject.duration,
            comboOffset: hitObject.comboOffset,
            hitSound,
          });
        }
      }
    }

    function getLayer(
      sample: HitSample,
      time: number,
    ): HitSoundLayer | undefined {
      let type: SampleType | undefined = undefined;

      switch (sample.hitSound) {
        case 'Normal':
          type = SampleType.Normal;
          break;
        case 'Whistle':
          type = SampleType.Whistle;
          break;
        case 'Clap':
          type = SampleType.Clap;
          break;
        case 'Finish':
          type = SampleType.Finish;
          break;
      }

      let sampleSet: SampleSet | undefined = undefined;

      let s = sample.sampleSet;
      if (s === 'None')
        s = imported.controlPoints.samplePointAt(time + 5).sampleSet;
      if (s === 'None') {
        switch (imported.general.sampleSet) {
          case 0:
            s = 'Soft';
            break;
          case 1:
            s = 'Normal';
            break;
          case 2:
            s = 'Soft';
            break;
          case 3:
            s = 'Drum';
            break;
        }
      }

      switch (s) {
        case 'Normal':
          sampleSet = SampleSet.Normal;
          break;
        case 'Soft':
          sampleSet = SampleSet.Soft;
          break;
        case 'Drum':
          sampleSet = SampleSet.Drum;
          break;
      }

      if (type === undefined || sampleSet === undefined) return undefined;

      return hitSounds.layers.find(
        (it) => it.sampleSet === sampleSet && it.type === type,
      );
    }

    for (const hitObject of imported.hitObjects) {
      if (hitObject instanceof Circle) {
        for (const sample of hitObject.samples) {
          const layer = getLayer(sample, hitObject.startTime);
          if (layer)
            layer.samples.push(
              new HitSoundSample({
                time: hitObject.startTime,
                id: hitObjectId(),
              }),
            );
        }
      } else if (hitObject instanceof Slider) {
        for (let i = 0; i < hitObject.nodeSamples.length; i++) {
          const time = hitObject.startTime + i * hitObject.spanDuration;
          for (const sample of hitObject.nodeSamples[i]) {
            const layer = getLayer(sample, time);
            if (layer)
              layer.samples.push(
                new HitSoundSample({
                  time,
                  id: hitObjectId(),
                }),
              );
          }
        }
      }
    }

    for (const timingPoint of imported.controlPoints.timingPoints) {
      timing.push({
        time: timingPoint.startTime,
        beatLength: timingPoint.beatLength,
      });
    }

    for (const velocityPoint of imported.controlPoints.difficultyPoints) {
      velocity.push({
        time: velocityPoint.startTime,
        velocity: velocityPoint.sliderVelocity,
      });
    }

    const colors = imported.colors.comboColors.map((c) => c.hex);

    const bookmarks: SerializedEditorBookmark[] = imported.editor.bookmarks.map(
      (time) => ({ time, name: null }),
    );

    let backgroundPath: string | null = null;
    if (imported.events.backgroundPath) {
      backgroundPath = imported.events.backgroundPath;
    }

    const difficulty = {
      hpDrainRate: imported.difficulty.drainRate,
      circleSize: imported.difficulty.circleSize,
      overallDifficulty: imported.difficulty.overallDifficulty,
      approachRate: imported.difficulty.approachRate,
      sliderMultiplier: imported.difficulty.sliderMultiplier,
      sliderTickRate: imported.difficulty.sliderTickRate,
    };

    const general = {
      stackLeniency: imported.general.stackLeniency,
    };

    const data: BeatmapData = {
      version: BeatmapMigrator.migrations.length,
      hitObjects,
      controlPoints: {
        timing,
        velocity,
      },
      colors,
      bookmarks,
      backgroundPath,
      difficulty,
      general,
      audioFilename: imported.general.audioFilename,
      hitSounds: hitSounds.serialize(),
      previewTime: imported.general.previewTime,
    };

    return { beatmap: entity, data };
  }

  convertPathPoint(point: OsuPathPoint): PathPoint {
    let type: PathType | null = null;
    switch (point.type) {
      case 'L':
        type = PathType.Linear;
        break;
      case 'P':
        type = PathType.PerfectCurve;
        break;
      case 'C':
        type = PathType.Catmull;
        break;
      case 'B':
        type = PathType.Bezier;
        break;
    }
    return new PathPoint(Vec2.from(point.position), type);
  }

  private getHitSound(hitObject: StandardHitObject): HitSound {
    return this.toHitSound(hitObject.samples);
  }

  toHitSound(samples: HitSample[]) {
    const hitSound = defaultHitSound();
    for (const sample of samples) {
      if (sample.hitSound === 'Normal') {
        switch (sample.sampleSet) {
          case 'Drum':
            hitSound.sampleSet = SampleSet.Drum;
            break;
          case 'Normal':
            hitSound.sampleSet = SampleSet.Normal;
            break;
          case 'Soft':
            hitSound.sampleSet = SampleSet.Soft;
            break;
        }
      } else {
        switch (sample.sampleSet) {
          case 'Drum':
            hitSound.additionSet = SampleSet.Drum;
            break;
          case 'Normal':
            hitSound.additionSet = SampleSet.Normal;
            break;
          case 'Soft':
            hitSound.additionSet = SampleSet.Soft;
            break;
        }
        switch (sample.hitSound) {
          case 'Whistle':
            hitSound.additions |= Additions.Whistle;
            break;
          case 'Finish':
            hitSound.additions |= Additions.Finish;
            break;
          case 'Clap':
            hitSound.additions |= Additions.Clap;
            break;
        }
      }
    }
    return hitSound;
  }
}
