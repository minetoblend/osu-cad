import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { AuditEvents } from './audit-events';

@Entity('audit_event')
export class AuditEventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  user: UserEntity;

  @Column({ type: 'varchar', length: 64, nullable: false })
  action: keyof AuditEvents;

  @Column({ type: 'json', nullable: false })
  details: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;
}
