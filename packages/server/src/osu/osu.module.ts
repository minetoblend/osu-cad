import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OsuApiService } from './osu-api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OsuUserEntity } from './osu-user.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([OsuUserEntity])],
  providers: [OsuApiService],
  exports: [OsuApiService],
})
export class OsuModule {}
