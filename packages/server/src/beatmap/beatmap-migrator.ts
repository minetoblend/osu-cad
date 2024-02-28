import { Injectable } from '@nestjs/common';
import {
  BeatmapData,
  ControlPointManager,
  HitObjectManager,
  Slider,
} from '@osucad/common';
import { KeyOf } from '@bull-board/api/dist/typings/utils';

@Injectable()
export class BeatmapMigrator {
  async migrate(data: BeatmapData) {
    let version = data.version;
    if (version === undefined) {
      version = 1;
    }

    const migrations = BeatmapMigrator.migrations.slice(version - 1);
    for (const migration of migrations) {
      data = (await this[migration](data)) as unknown as BeatmapData;
    }
    data.version = BeatmapMigrator.migrations.length;
    return data;
  }

  static readonly migrations: KeyOf<BeatmapMigrator> = ['migrate_2'];

  migrate_2(data: BeatmapData): BeatmapData {
    const controlPoints = ControlPointManager.fromLegacy(data.controlPoints);
    const hitObjects = new HitObjectManager(
      data.hitObjects,
      data.difficulty,
      controlPoints,
      data.general,
    );

    for (const hitObject of hitObjects.hitObjects) {
      if (hitObject instanceof Slider && hitObject.velocityOverride !== null) {
        hitObject.velocityOverride /= hitObject.baseVelocity;
      }
    }

    data = {
      ...data,
      hitObjects: hitObjects.serialize(),
    };

    return data;
  }
}
