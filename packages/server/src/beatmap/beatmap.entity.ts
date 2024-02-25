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
import { BeatmapAccess, BeatmapInfo, randomString } from '@osucad/common';

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

  getInfo(): BeatmapInfo {
    return {
      id: this.uuid,
      name: this.name,
      starRating: this.starRating,
      links: {
        self: {
          href: `/api/beatmaps/${this.uuid}`,
        },
        edit: {
          href: `/edit/${this.shareId}`,
        },
      },
    };
  }

  @BeforeInsert()
  protected generateShareId() {
    this.shareId = randomString(12);
  }
}
