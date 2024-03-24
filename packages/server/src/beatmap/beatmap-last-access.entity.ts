import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { BeatmapEntity } from './beatmap.entity';
import { UserEntity } from '../users/user.entity';

@Entity('beatmap_last_access')
export class BeatmapLastAccessEntity {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  beatmapId: number;

  @ManyToOne(() => BeatmapEntity)
  @JoinColumn({ name: 'beatmapId' })
  beatmap: BeatmapEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  date: Date;
}
