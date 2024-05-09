import { Injectable } from '@nestjs/common';
import { UserEntity } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditEventEntity } from './audit-event.entity';
import { Repository } from 'typeorm';
import { AuditAction, AuditDetails } from '@osucad/common';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditEventEntity)
    private readonly repository: Repository<AuditEventEntity>,
  ) {}

  async record<T extends AuditAction>(
    user: UserEntity,
    action: T,
    details: AuditDetails<T>,
  ) {
    const event = new AuditEventEntity();
    event.user = user;
    event.action = action;
    event.details = details;
    await this.repository.save(event);
  }

  getEvents(options: { after?: number } = {}): Promise<AuditEventEntity[]> {
    const query = this.repository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.user', 'user');

    if (options.after) {
      query.andWhere('event.id > :after', { after: options.after });
    }

    return query.orderBy('event.id', 'DESC').limit(100).getMany();
  }
}
