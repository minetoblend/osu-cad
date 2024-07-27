import {
  BeforeInsert,
  Column,
  Entity,
  Generated,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MapsetEntity } from './mapset.entity';
import { BeatmapAccess, randomString } from '@osucad/common';
import { S3AssetEntity } from '../assets/s3-asset.entity';
import { EditorSessionEntity } from '../editor/editor-session.entity';
import { ParticipantEntity } from './participant.entity';
import { BeatmapLastAccessEntity } from './beatmap-last-access.entity';

@Entity('beatmaps')
export class BeatmapEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  osuId: number | null;

  @Column('boolean', { default: true })
  needsDiffCalc: boolean;

  @Column('float')
  starRating: number;

  @Column('boolean', { default: false })
  deleted: boolean;

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

  @Column('integer', { nullable: true })
  previewTime: number | null;

  @ManyToOne(() => S3AssetEntity, { nullable: true, eager: true })
  audioFile: S3AssetEntity;

  @Column({ nullable: true })
  thumbnailId: string | null;

  @OneToMany(() => EditorSessionEntity, (session) => session.beatmap)
  sessions: EditorSessionEntity[];

  @OneToMany(() => ParticipantEntity, (participant) => participant.beatmap)
  participants: ParticipantEntity[];

  @OneToMany(() => BeatmapLastAccessEntity, (lastAccess) => lastAccess.beatmap)
  lastAccess: BeatmapLastAccessEntity[];

  @BeforeInsert()
  protected generateShareId() {
    this.shareId = randomString(12);
  }
}
