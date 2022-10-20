import {Module} from '@nestjs/common';
import {OsuController} from './osu.controller';
import {HttpModule} from "@nestjs/axios";
import {OsuApiService} from "./osu.api.service";

@Module({
  imports: [HttpModule],
  providers: [OsuApiService],
  controllers: [OsuController],
  exports: [OsuApiService]
})
export class OsuModule {}
