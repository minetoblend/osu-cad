import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'p_user' })
export class User {
  @PrimaryColumn({ type: 'int', generated: false, nullable: false })
  id!: number;

  @Column({ type: 'varchar', length: 32, nullable: false })
  username!: string;

  @Column({ type: 'int', nullable: true })
  lastObjectPlaced: number | null = null;
}
