import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';

@Entity({ name: 'p_hitobject' })
export class HitObject {
  @PrimaryColumn({ type: 'varchar', generated: false, nullable: false })
  id!: string;

  @ManyToOne(() => User, { nullable: false })
  placedBy!: User;

  @Column({ type: 'int' })
  placedAt!: number;
}
