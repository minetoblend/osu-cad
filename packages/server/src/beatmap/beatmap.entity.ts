import {
  BeforeInsert,
  Column,
  Entity,
  Generated,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MapsetEntity } from './mapset.entity';
import { BeatmapAccess, randomString } from '@osucad/common';
import { S3AssetEntity } from '../assets/s3-asset.entity';

@Entity('beatmaps')
export class BeatmapEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column({ nullable: true })
  osuId: number | null;
  @Column('float')
  starRating: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @ManyToOne(() => MapsetEntity, (mapset) => mapset.beatmaps)
  mapset: MapsetEntity;

  @Column('int', { default: BeatmapAccess.None })
  access: BeatmapAccess = BeatmapAccess.None;

  @Column('char', { length: 12, default: '' })
  @Index({ unique: true })
  shareId: string;

  @Column({ default: true })
  needsThumbnail: boolean = true;

  @ManyToOne(() => S3AssetEntity, { nullable: true })
  thumbnailLarge: S3AssetEntity;

  @ManyToOne(() => S3AssetEntity, { nullable: true })
  thumbnailSmall: S3AssetEntity;

  @BeforeInsert()
  protected generateShareId() {
    this.shareId = randomString(12);
  }
}
