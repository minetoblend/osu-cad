import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EditorRoomService } from '../editor/editor-room.service';
import { BeatmapEntity } from './beatmap.entity';
import { Circle, Slider, Spinner, StandardBeatmap } from 'osu-standard-stable';
import {
  Beatmap,
  Color4,
  DifficultyPoint,
  HitSample,
  HitSound,
  HitType,
  PathPoint,
  PathType,
  TimingPoint,
  Vector2,
} from 'osu-classes';
import {
  BeatmapData,
  ControlPointManager,
  PathType as EditorPathType,
} from '@osucad/common';
import { MapsetEntity } from './mapset.entity';
import { BeatmapEncoder } from 'osu-parsers';
import { BeatmapImportService } from './beatmap-import.service';
import * as JSZip from 'jszip';
import { BeatmapSnapshotService } from './beatmap-snapshot.service';
import { BeatmapMigrator } from './beatmap-migrator';
import { AssetsService } from 'src/assets/assets.service';
import { AssetEntity } from 'src/assets/asset.entity';

@Injectable()
export class BeatmapExportService {
  constructor(
    @Inject(forwardRef(() => EditorRoomService))
    private readonly roomManager: EditorRoomService,
    private readonly beatmapImportService: BeatmapImportService,
    private readonly snapshotService: BeatmapSnapshotService,
    private readonly assetsService: AssetsService,
  ) {}

  async convertMapset(mapset: MapsetEntity) {
    mapset.beatmaps.forEach((it) => (it.mapset = mapset));

    const archive = new JSZip();
    const encoder = new BeatmapEncoder();

    const assets = await this.assetsService.getAssetsForBeatmap(mapset);

    await this.writeAssetsToArchive(archive, assets);

    for (const beatmap of mapset.beatmaps) {
      const snapshot = await this.snapshotService.getLatestSnapshot(beatmap);

      if (!snapshot) throw new Error('No snapshot found for beatmap');

      let beatmapData = snapshot.data;

      const room = await this.roomManager.getRoom(beatmap.uuid);

      if (room) {
        const beatmap = room.beatmap.serialize();
        beatmapData = {
          version: BeatmapMigrator.migrations.length,
          general: beatmap.general,
          audioFilename: beatmap.audioFilename,
          backgroundPath: beatmap.backgroundPath,
          colors: beatmap.colors,
          difficulty: beatmap.difficulty,
          bookmarks: beatmap.bookmarks,
          controlPoints: new ControlPointManager(
            beatmap.controlPoints,
          ).serializeLegacy(),
          hitObjects: beatmap.hitObjects,
          hitSounds: beatmap.hitSounds,
        };
      }

      const converted = this.convertBeatmap(beatmap, beatmapData);

      converted.fileFormat = 14;

      const filename = `${converted.metadata.artist} - ${converted.metadata.title} (${converted.metadata.creator}) [${converted.metadata.version}].osu`;

      archive.file(filename, encoder.encodeToString(converted));
    }

    return archive;
  }

  private async writeAssetsToArchive(archive: JSZip, assets: AssetEntity[]) {
    for (const asset of assets) {
      let path = asset.path;
      if (path.startsWith('/')) path = path.slice(1);

      const buffer = await this.assetsService.getAssetContent(asset);

      if (buffer) {
        archive.file(path, buffer);
      }
    }
  }

  convertBeatmap(
    entity: BeatmapEntity,
    beatmapData: BeatmapData,
  ): StandardBeatmap {
    const beatmap = new StandardBeatmap();
    this.applyMetadata(beatmap, entity);
    this.applyGeneral(beatmap, beatmapData);
    this.applyDifficulty(beatmap, beatmapData);

    for (const timingPoint of beatmapData.controlPoints.timing) {
      const converted = new TimingPoint();
      converted.beatLength = timingPoint.beatLength;
      beatmap.controlPoints.add(converted, timingPoint.time);
    }
    for (const velocityPoint of beatmapData.controlPoints.velocity) {
      const converted = new DifficultyPoint();
      converted.isLegacy = true;
      converted.sliderVelocity = velocityPoint.velocity;
      beatmap.controlPoints.add(converted, velocityPoint.time);
    }

    for (const hitObject of beatmapData.hitObjects) {
      if (hitObject.type === 'circle') {
        const circle = new Circle();
        circle.startPosition = new Vector2(
          Math.round(hitObject.position.x),
          Math.round(hitObject.position.y),
        );
        circle.startTime = Math.round(hitObject.startTime);
        circle.isNewCombo = hitObject.newCombo;
        circle.comboOffset = hitObject.comboOffset ?? 0;

        beatmap.hitObjects.push(circle);
      }

      if (hitObject.type === 'slider') {
        const slider = new Slider();
        slider.startPosition = new Vector2(
          Math.round(hitObject.position.x),
          Math.round(hitObject.position.y),
        );
        slider.startTime = Math.round(hitObject.startTime);
        slider.isNewCombo = hitObject.newCombo;
        slider.comboOffset = hitObject.comboOffset ?? 0;

        let type: PathType;
        switch (hitObject.path[0].type) {
          case EditorPathType.Bezier:
            type = PathType.Bezier;
            break;
          case EditorPathType.Catmull:
            type = PathType.Catmull;
            break;
          case EditorPathType.Linear:
            type = PathType.Linear;
            break;
          case EditorPathType.PerfectCurve:
            type = PathType.PerfectCurve;
            break;
          default:
            throw new Error('Invalid path type');
        }

        slider.path.curveType = type;
        slider.path.controlPoints = [];
        for (const point of hitObject.path) {
          slider.path.controlPoints.push({
            position: new Vector2(Math.round(point.x), Math.round(point.y)),
            type: slider.path.controlPoints.length === 0 ? type : null,
          });
          if (point.type != null && slider.path.controlPoints.length > 1) {
            slider.path.controlPoints.push(
              new PathPoint(
                new Vector2(Math.round(point.x), Math.round(point.y)),
                null,
              ),
            );
          }
        }
        slider.path.expectedDistance = hitObject.expectedDistance;
        if (hitObject.velocity !== null && hitObject.velocity !== undefined) {
          if (hitObject.velocity) {
            const point = new DifficultyPoint();
            point.sliderVelocity = hitObject.velocity;
            beatmap.controlPoints.add(point, hitObject.startTime);
          }
        }
        slider.repeats = hitObject.repeats;
        beatmap.hitObjects.push(slider);
      } else if (hitObject.type === 'spinner') {
        const spinner = new Spinner();
        spinner.startTime = Math.round(hitObject.startTime);
        spinner.endTime = Math.round(hitObject.startTime + hitObject.duration);
        spinner.isNewCombo = hitObject.newCombo;
        beatmap.hitObjects.push(spinner);
      }
    }

    for (const hitObject of beatmap.hitObjects) {
      const sample = new HitSample();
      hitObject.samples = [sample];
      hitObject.hitSound = HitSound.None;

      if (hitObject instanceof Circle) hitObject.hitType = HitType.Normal;
      if (hitObject instanceof Slider) hitObject.hitType = HitType.Slider;
      if (hitObject instanceof Spinner) hitObject.hitType = HitType.Spinner;
      if (hitObject.isNewCombo) hitObject.hitType |= HitType.NewCombo;

      if (hitObject instanceof Slider) {
        for (let i = 0; i < hitObject.spans; i++) {
          hitObject.samples.push(new HitSample());
        }
      }
    }

    beatmap.colors.comboColors = beatmapData.colors.map((it) => {
      const asInt = parseInt(it.slice(1), 16);
      return new Color4(
        (asInt >> 16) & 0xff,
        (asInt >> 8) & 0xff,
        asInt & 0xff,
      );
    });
    beatmap.events.backgroundPath = beatmapData.backgroundPath;
    beatmap.editor.bookmarks = beatmapData.bookmarks.map((it) => it.time);
    return beatmap;
  }

  private applyMetadata(beatmap: Beatmap, entity: BeatmapEntity) {
    beatmap.metadata.artist = entity.mapset.artist;
    beatmap.metadata.title = entity.mapset.title;
    beatmap.metadata.creator = entity.mapset.creator.id.toString();
    beatmap.metadata.version = entity.name;
  }

  private applyGeneral(beatmap: Beatmap, data: BeatmapData) {
    beatmap.general.stackLeniency = data.general.stackLeniency;
    beatmap.general.audioFilename = data.audioFilename;
  }

  private applyDifficulty(beatmap: Beatmap, data: BeatmapData) {
    beatmap.difficulty.drainRate = data.difficulty.hpDrainRate;
    beatmap.difficulty.circleSize = data.difficulty.circleSize;
    beatmap.difficulty.overallDifficulty = data.difficulty.overallDifficulty;
    beatmap.difficulty.approachRate = data.difficulty.approachRate;
    beatmap.difficulty.sliderMultiplier = data.difficulty.sliderMultiplier;
    beatmap.difficulty.sliderTickRate = data.difficulty.sliderTickRate;
  }
}
