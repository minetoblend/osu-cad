import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'p_beatmap_snapshot' })
export class BeatmapSnapshot {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int', nullable: false })
  timestamp!: number;

  @Column({ type: 'varchar', length: 1_000_000, nullable: false })
  data!: string;
}
