import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { CLIENT_TOKEN_STRING_LENGTH } from './constants';

@Entity('client_token')
export class ClientTokenEntity {
  @PrimaryColumn({
    name: 'token',
    type: 'char',
    length: CLIENT_TOKEN_STRING_LENGTH,
  })
  token: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
  })
  expiresAt: Date;

  @Column({
    name: 'used_at',
    type: 'timestamp',
    nullable: true,
  })
  usedAt: Date | null;
}
