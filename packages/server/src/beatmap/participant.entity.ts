import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BeatmapEntity } from './beatmap.entity';
import { BeatmapAccess } from '@osucad/common';
import { OsuUserEntity } from '../osu/osu-user.entity';

@Entity('participant')
export class ParticipantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BeatmapEntity, { nullable: false })
  beatmap!: BeatmapEntity;

  @ManyToOne(() => OsuUserEntity, { nullable: false })
  user!: OsuUserEntity;

  @Column('int')
  access: BeatmapAccess;
}
