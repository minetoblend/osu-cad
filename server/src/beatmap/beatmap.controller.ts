import {Body, Controller, Get, Param, Post, Req, Res, UseGuards} from '@nestjs/common';

import * as osuParser from 'osu-parser'
import {Response} from "express";
import * as path from "path";
import {OsuApiService} from "../osu/osu.api.service";
import {AuthGuard} from "@nestjs/passport";
import {promisify} from "util";
import * as fs from "fs";
import {BeatmapService} from "./beatmap.service";
import {BeatmapSchema} from "./schema/beatmap.schema";
import {BeatmapDecoder} from "osu-parsers";

@Controller('beatmap')
export class BeatmapController {

    constructor(
        private osuApi: OsuApiService,
        private beatmapService: BeatmapService
    ) {
    }

    @Get('own')
    @UseGuards(AuthGuard('jwt'))
    async getOwnBetamaps(@Req() req) {
        const user = req.user
        const sets = await this.beatmapService.findSetsByOwner(user)
        return sets.map(set => {
            return {
                ...set,
                difficulties: set.difficulties.map(difficulty => {
                    const {beatmapData, ...data} = difficulty
                    return data
                })
            }
        })
    }


    @Get('/import/:id')
    @UseGuards(AuthGuard('jwt'))
    async load(@Req() req, @Param('id') id: string) {
        const path = await this.osuApi.downloadBeatmapset(id)
        return await this.beatmapService.importFromDirectory(path, req.user)
    }

    @Get('/:id')
    async getTest(@Param('id') id: string) {
        if (id.includes('_')) {
            const [mapsetId, beatmapId] = id.split('_')
            const mapsetPath = await this.osuApi.downloadBeatmapset(mapsetId)
            const files = await promisify(fs.readdir)(mapsetPath)

            for (const file of files) {
                if (file.endsWith('.osu')) {
                    const content = await promisify(fs.readFile)(path.resolve(mapsetPath, file), 'utf-8')

                    const decoder = new BeatmapDecoder()
                    const parsedBeatmap = decoder.decodeFromString(content)


                    return this.beatmapService.importBeatmap(parsedBeatmap).beatmapData
                }
            }
        }

        try {
            const existing = await this.beatmapService.findBeatmapById(id)
            if (existing) {
                return existing.beatmapData
            }
        } catch (e) {
        }

        return {
            hitObjects: [],
            timingPoints: [
                {
                    time: 1676,
                    timing: {
                        bpm: 180,
                        signature: 4,
                    },
                    sv: 1,
                    volume: 1,
                }
            ],
            difficulty: {
                hpDrainRate: 5,
                circleSize: 4,
                overallDifficulty: 8,
                approachRate: 9,
                sliderMultiplier: 1.4,
                sliderTickRate: 1
            },
        }
    }

    @Get(':id/audio')
    @UseGuards(AuthGuard('jwt'))
    async getAudio(@Res() response: Response, @Param('id') id: string) {
        if (id.includes('_')) {
            const [mapsetId, beatmapId] = id.split('_')
            const mapsetPath = await this.osuApi.downloadBeatmapset(mapsetId)
            const files = await promisify(fs.readdir)(mapsetPath)

            for (const file of files) {
                if (file.endsWith('.osu')) {
                    const content = await promisify(fs.readFile)(path.resolve(mapsetPath, file), 'utf-8')
                    const beatmap = osuParser.parseContent(content)

                    if (beatmap.BeatmapID === beatmapId) {
                        response.sendFile(path.resolve(mapsetPath, beatmap.AudioFilename))
                        return
                    }
                }
            }
        }

        try {
            const existing = await this.beatmapService.findBeatmapById(id)
            const audioPath = path.resolve('data/beatmap', existing.mapSet.id, 'audio.mp3')
            response.sendFile(audioPath)
            return;

        } catch (e) {
        }
        response.sendFile(path.resolve('media', 'test_audiol.mp3'))
    }

    @Post(':id')
    async saveBeatmap(@Param('id') id: string, @Body() data: BeatmapSchema) {
        try {
            const beatmap = await this.beatmapService.findBeatmapById(id)
            beatmap.beatmapData = data
            await this.beatmapService.updateBeatmap(beatmap)
        } catch (e) {

        }

    }


}
