import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditEventEntity } from './audit-event.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditEventEntity])],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
