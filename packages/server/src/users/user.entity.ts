import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";
import { UserInfo } from "@osucad/common";

@Entity("users")
export class UserEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  avatarUrl: string | null;

  @CreateDateColumn()
  created: Date;

  getInfo(): UserInfo {
    return {
      id: this.id,
      username: this.username,
      avatarUrl: this.avatarUrl,
    };
  }
}
