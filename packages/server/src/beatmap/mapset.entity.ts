import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { BeatmapEntity } from './beatmap.entity';
import { BeatmapAccess, MapsetInfo } from '@osucad/common';

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
  s3Storage: boolean;

  @ManyToOne(() => UserEntity)
  creator: UserEntity;

  @OneToMany(() => BeatmapEntity, (beatmap) => beatmap.mapset)
  beatmaps: BeatmapEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  getInfo(): MapsetInfo {
    return {
      id: this.id,
      title: this.title,
      artist: this.artist,
      tags: this.tags,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      creator: this.creator.getInfo(),
      beatmaps: this.beatmaps.map((beatmap) => beatmap.getInfo()),
      links: {
        self: {
          href: `/api/mapsets/${this.id}`,
        },
        background: {
          href: `/api/mapsets/${this.id}/files/${encodeURIComponent(
            this.background,
          )}`,
        },
      },
    };
  }
}
