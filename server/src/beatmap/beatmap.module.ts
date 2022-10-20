import {Module} from '@nestjs/common';
import {BeatmapController} from './beatmap.controller';
import {OsuModule} from "../osu/osu.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Beatmap, BeatmapSet} from "./beatmap.entity";
import {BeatmapService} from "./beatmap.service";

@Module({
    imports: [OsuModule, TypeOrmModule.forFeature([Beatmap, BeatmapSet])],
    providers: [BeatmapService],
    controllers: [BeatmapController]
})
export class BeatmapModule {
}
