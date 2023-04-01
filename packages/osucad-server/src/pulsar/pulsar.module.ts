import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { PulsarService } from './pulsar.service';

@Module({
  imports: [ConfigModule],
  providers: [PulsarService],
  exports: [PulsarService],
})
export class PulsarModule {}
