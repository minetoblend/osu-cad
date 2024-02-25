import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BeatmapEntity } from '../beatmap/beatmap.entity';

@Entity('editor_room')
export class EditorRoomEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('boolean', { default: true })
  active: boolean;

  @ManyToOne(() => BeatmapEntity)
  beatmap: BeatmapEntity;

  @Column('timestamp', {
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  beginDate: Date;

  @Column('timestamp', { nullable: true })
  endDate: Date;
}
