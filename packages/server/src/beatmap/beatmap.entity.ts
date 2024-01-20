import {Column, Entity, Generated, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {MapsetEntity} from "./mapset.entity";
import {BeatmapData, BeatmapInfo} from "@osucad/common";

@Entity("beatmaps")
export class BeatmapEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column({ nullable: true })
  osuId: number | null;
  @Column("float")
  starRating: number;

  @Column()
  @Generated("uuid")
  uuid: string;

  @ManyToOne(() => MapsetEntity, mapset => mapset.beatmaps)
  mapset: MapsetEntity;

  @Column("json")
  data: BeatmapData;

  getInfo(): BeatmapInfo {
    return {
      id: this.uuid,
      name: this.name,
      starRating: this.starRating,
    };
  }

}

export const enum BeatmapAccess {
  Private = 0,
  Spectator = 1,
  Modder = 2,
  Mapper = 3,
}