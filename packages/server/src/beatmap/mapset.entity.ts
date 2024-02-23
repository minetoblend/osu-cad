import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "../users/user.entity";
import { BeatmapAccess, BeatmapEntity } from "./beatmap.entity";
import { MapsetInfo } from "@osucad/common";

@Entity("mapsets")
export class MapsetEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  title: string;
  @Column()
  artist: string;
  @Column({ nullable: true })
  osuId: number | null;
  @Column("simple-array")
  tags: string[];
  @Column({ nullable: true })
  background: string | null;
  @Column("int")
  access: BeatmapAccess = BeatmapAccess.Private;

  @ManyToOne(() => UserEntity)
  creator: UserEntity;

  @OneToMany(() => BeatmapEntity, (beatmap) => beatmap.mapset)
  beatmaps: BeatmapEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  getInfo(): MapsetInfo {
    return {
      id: this.id,
      title: this.title,
      artist: this.artist,
      tags: this.tags,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      backgroundPath: this.background,
      creator: this.creator.getInfo(),
      beatmaps: this.beatmaps.map((beatmap) => beatmap.getInfo()),
    };
  }
}
