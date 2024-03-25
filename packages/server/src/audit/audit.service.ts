import { Injectable } from '@nestjs/common';
import { UserEntity } from '../users/user.entity';
import { AuditEvents } from './audit-events';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditEventEntity } from './audit-event.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditEventEntity)
    private readonly auditRepository: Repository<AuditEventEntity>,
  ) {}

  async record<T extends keyof AuditEvents>(
    user: UserEntity,
    action: T,
    details: AuditEvents[T],
  ) {
    const event = new AuditEventEntity();
    event.user = user;
    event.action = action;
    event.details = details;
    await this.auditRepository.save(event);
  }
}
