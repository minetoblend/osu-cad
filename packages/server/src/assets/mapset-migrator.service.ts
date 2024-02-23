import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MapsetEntity } from '../beatmap/mapset.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetsService } from './assets.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MapsetMigratorService {
  constructor(
    private readonly assetsService: AssetsService,
    @InjectRepository(MapsetEntity)
    private readonly mapsetRepository: Repository<MapsetEntity>,
  ) {
    this.run();
  }

  private readonly logger = new Logger(MapsetMigratorService.name);

  private async run() {
    const count = await this.mapsetRepository.count({
      where: {
        s3Storage: false,
      },
    });
    this.logger.log(`Found ${count} mapsets to migrate`);

    while (true) {
      const mapset = await this.mapsetRepository.findOneBy({
        s3Storage: false,
      });

      if (!mapset) {
        break;
      }

      await this.migrateMapset(mapset);
    }
  }

  private async migrateMapset(mapset: MapsetEntity) {
    this.logger.log(
      `Migrating mapset ${mapset.id}: ${mapset.artist} - ${mapset.title}`,
    );

    const directory = path.join('files/mapsets', mapset.id);
    if (!fs.existsSync(directory))
      throw new Error(`Mapset directory not found: ${directory}`);

    const files = await this.readdirRecursive(directory);

    this.logger.log(`Found ${files.length} files`);

    let i = 0;
    for (const file of files) {
      const fullPath = path.join(directory, file);
      const buffer = await fs.promises.readFile(fullPath);
      this.logger.log(`Adding ${file}. ${i + 1}/${files.length}`);
      await this.assetsService.addAssetToMapset({
        mapset,
        buffer,
        path: file,
      });
      this.logger.log(`Added ${file}. ${i + 1}/${files.length}`);
      i++;
    }

    mapset.s3Storage = true;
    await this.mapsetRepository.save(mapset);

    this.logger.log(
      `Migrated mapset ${mapset.id}: ${mapset.artist} - ${mapset.title}`,
    );
  }

  private async readdirRecursive(
    dir: string,
    prefix: string = '',
  ): Promise<string[]> {
    const entries = await fs.promises.readdir(dir);

    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const relativePath = path.join(prefix, entry).replaceAll('\\', '/');
      const stats = await fs.promises.stat(fullPath);
      if (stats.isDirectory()) {
        files.push(...(await this.readdirRecursive(fullPath, relativePath)));
      } else {
        files.push(relativePath);
      }
    }

    return files;
  }
}
