import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { UserInfo } from '@osucad/common';

@Entity('users')
export class UserEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  avatarUrl: string | null;

  @CreateDateColumn()
  created: Date;

  @Column('boolean', { default: false })
  isAdmin: boolean;

  getInfo(): UserInfo {
    return {
      id: this.id,
      username: this.username,
      avatarUrl: this.avatarUrl,
      isAdmin: this.isAdmin,
      links: {
        self: {
          href: `/api/users/${this.id}`,
        },
        profile: {
          href: `/users/${this.id}`,
        },
      },
    };
  }
}
