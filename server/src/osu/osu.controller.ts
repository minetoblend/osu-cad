import {Controller, Get, Req, UseGuards} from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import {OsuApiService} from "./osu.api.service";
import {map, zip} from "rxjs";

@Controller('osu')
export class OsuController {

    constructor(private readonly osuApiService: OsuApiService) {
    }

    @Get('/me/beatmaps')
    @UseGuards(AuthGuard('jwt'))
    getOwnBeatmaps(@Req() req) {
        const pending = this.osuApiService.getOwnBeatmaps(req.user, 'pending')
        const graved = this.osuApiService.getOwnBeatmaps(req.user, 'graveyard')
        const ranked = this.osuApiService.getOwnBeatmaps(req.user, 'ranked')
        const loved = this.osuApiService.getOwnBeatmaps(req.user, 'loved')
        const guest = this.osuApiService.getOwnBeatmaps(req.user, 'guest')

        return zip(pending, graved, ranked, loved, guest)
            .pipe(map(res => [].concat(...res)))
    }



}
