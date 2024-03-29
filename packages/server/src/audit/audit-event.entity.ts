import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { AuditAction } from '@osucad/common';

@Entity('audit_event')
export class AuditEventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  user: UserEntity;

  @Column({ type: 'varchar', length: 64, nullable: false })
  action: AuditAction;

  @Column({ type: 'json', nullable: false })
  details: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;
}
