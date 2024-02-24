import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BeatmapEntity } from './beatmap.entity';
import { BeatmapData } from '@osucad/common';

@Entity('beatmap_snapshot')
export class BeatmapSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BeatmapEntity)
  beatmap: BeatmapEntity;

  /**
   * The timestamp when this snapshot was last updated.
   */
  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  timestamp: Date;

  /**
   * The timestamp when this snapshot was initially created.
   */
  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  createDate: Date;

  @Column()
  version: number;

  @Column('json')
  data: BeatmapData;
}
