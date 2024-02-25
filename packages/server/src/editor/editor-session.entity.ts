import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BeatmapEntity } from '../beatmap/beatmap.entity';
import { UserEntity } from '../users/user.entity';
import { EditorRoomEntity } from './editor-room.entity';

@Entity('editor_session')
export class EditorSessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EditorRoomEntity)
  room: EditorRoomEntity | null;

  @ManyToOne(() => BeatmapEntity)
  beatmap: BeatmapEntity;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @Column()
  @Index()
  beginDate: Date;

  @Column()
  @Index()
  endDate: Date;

  @Column('int', { default: 0 })
  duration: number;
}
