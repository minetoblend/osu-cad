import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OsuApiService } from './osu-api.service';

@Module({
  imports: [HttpModule],
  providers: [OsuApiService],
  exports: [OsuApiService],
})
export class OsuModule {}
