import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { BeatmapEntity } from './beatmap.entity';
import { BeatmapAccess } from '@osucad/common';
import { AssetEntity } from '../assets/asset.entity';

@Entity('mapsets')
export class MapsetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  artist: string;
  @Column({ nullable: true })
  osuId: number | null;
  @Column('simple-array')
  tags: string[];
  @Column({ nullable: true })
  background: string | null;
  @Column('int')
  access: BeatmapAccess = BeatmapAccess.None;
  @Column('boolean', { default: false })
  deleted: boolean;

  @Column('boolean', { default: false })
  s3Storage: boolean;

  @ManyToOne(() => UserEntity)
  creator: UserEntity;

  @OneToMany(() => BeatmapEntity, (beatmap) => beatmap.mapset)
  beatmaps: BeatmapEntity[];

  @OneToMany(() => AssetEntity, (asset) => asset.mapset)
  assets: AssetEntity[];

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  @Index()
  updatedAt: Date;
}
