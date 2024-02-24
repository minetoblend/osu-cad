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

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  timestamp: Date;

  @Column()
  version: number;

  @Column('json')
  data: BeatmapData;
}
