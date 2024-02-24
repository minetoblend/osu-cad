import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { S3AssetEntity } from './s3-asset.entity';
import { MapsetEntity } from '../beatmap/mapset.entity';

@Entity('assets')
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 512 })
  path: string;
  @ManyToOne(() => MapsetEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  mapset: MapsetEntity;
  @ManyToOne(() => S3AssetEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  asset: S3AssetEntity;
}
