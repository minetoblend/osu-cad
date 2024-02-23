import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BeatmapEntity } from "../beatmap/beatmap.entity";
import { UserEntity } from "../users/user.entity";

@Entity("editor_session")
export class EditorSessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

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
}
