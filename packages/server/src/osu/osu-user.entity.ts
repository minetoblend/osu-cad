import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('osu_users')
export class OsuUserEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  avatarUrl: string | null;

  @CreateDateColumn()
  created: Date;
}
