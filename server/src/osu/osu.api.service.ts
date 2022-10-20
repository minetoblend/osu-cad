import {Injectable} from "@nestjs/common";
import {HttpService} from "@nestjs/axios";
import {User} from "../user/user.entity";
import {firstValueFrom, map} from "rxjs";
import * as fs from "fs";
import * as util from "util";
import * as path from "path";
import * as AdmZip from "adm-zip";


@Injectable()
export class OsuApiService {

    constructor(private readonly httpService: HttpService) {
    }

    getOwnBeatmaps(user: User, status: 'graveyard' | 'pending' | 'ranked' | 'guest' | 'loved') {
        return this.httpService.get(`https://osu.ppy.sh/api/v2/users/${user.profileId}/beatmapsets/${status}?limit=50`, {
            headers: {
                Authorization: `Bearer ${user.accessToken}`
            }
        }).pipe(map(response => response.data))
    }

    async downloadBeatmapset(mapsetId: string | number) {

        const beatmapDirectory = path.resolve('data/beatmap')
        const destPath = path.resolve(beatmapDirectory, 'import_' + mapsetId.toString())

        if (!await util.promisify(fs.exists)(beatmapDirectory))
            await util.promisify(fs.mkdir)(beatmapDirectory)
        if (!await util.promisify(fs.exists)(destPath))
            await util.promisify(fs.mkdir)(destPath)

        const response = await firstValueFrom(
            this.httpService.get(`https://kitsu.moe/api/d/${mapsetId}`, {
                responseType: "arraybuffer"
            })
        )

        const zip = new AdmZip(response.data)

        console.log(zip.getEntries().map(it => it.entryName))
        zip.extractAllTo(destPath, false)

        return destPath
    }


}