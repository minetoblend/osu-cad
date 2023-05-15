import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { SessionData } from 'express-session';
import { InjectS3, S3 } from 'nestjs-s3';
import { AuthGuard } from 'src/auth/auth.guard';
import { BeatmapService } from 'src/beatmap/beatmap.service';
import { IEditorSessionToken } from './interfaces';
import { AssetService } from 'src/shared/asset.service';

@Controller('editor')
export class EditorController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly beatmapService: BeatmapService,
    private readonly assetService: AssetService,
  ) {}

  @Get('/token/:beatmap')
  @UseGuards(AuthGuard)
  async getToken(
    @Session() session: SessionData,
    @Param('beatmap') beatmapId: string,
  ) {
    const beatmap = await this.beatmapService.findById(beatmapId);

    if (!beatmap)
      throw new HttpException('Beatmap not found', HttpStatus.NOT_FOUND);

    const token: IEditorSessionToken = {
      beatmapId,
      user: session.user!,
    };

    const signedToken = await this.jwtService.signAsync(token, {
      expiresIn: '1h',
    });

    return {
      token: signedToken,
    };
  }

  @Get('/:beatmap/audio')
  @UseGuards(AuthGuard)
  // @1eader('Cache-Control', 'max-age=3600, public')
  async getAudio(
    @Param('beatmap') beatmapId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const beatmap = await this.beatmapService.findById(beatmapId);
    if (!beatmap)
      throw new HttpException('Beatmap not found', HttpStatus.NOT_FOUND);

    return this.assetService.getAssetUrl(beatmap.audio);
  }
}
