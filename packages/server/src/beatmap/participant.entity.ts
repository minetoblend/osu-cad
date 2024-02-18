import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {MapsetEntity} from "./mapset.entity";
import {UserEntity} from "../users/user.entity";
import {BeatmapAccess} from "./beatmap.entity";

@Entity("participant")
export class ParticipantEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => MapsetEntity)
  mapset!: MapsetEntity;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @Column("int")
  access: BeatmapAccess;

}