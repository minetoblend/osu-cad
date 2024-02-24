import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { BeatmapEntity } from './beatmap.entity';
import { BeatmapAccess } from '@osucad/common';

@Entity('participant')
export class ParticipantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BeatmapEntity)
  beatmap!: BeatmapEntity;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @Column('int')
  access: BeatmapAccess;
}
