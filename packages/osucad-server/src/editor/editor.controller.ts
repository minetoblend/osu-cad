import { InjectS3, S3 } from 'nestjs-s3';
import {
  Controller,
  Get,
  Header,
  Param,
  Res,
  Session,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { IEditorSessionToken } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { SessionData } from 'express-session';
import { Response } from 'express';

@Controller('editor')
export class EditorController {
  constructor(
    private readonly jwtService: JwtService,
    @InjectS3()
    private readonly s3: S3,
  ) {}

  @Get('/token/:beatmap')
  @UseGuards(AuthGuard)
  async getToken(
    @Session() session: SessionData,
    @Param('beatmap') beatmapId: string,
  ) {
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
  @Header('Cache-Control', 'max-age=3600, public')
  async getAudio(
    @Param('beatmap') beatmapId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const object = await this.s3
      .getObject({
        Bucket: 'beatmaps',
        Key: `Hifumi, Daisuki-AFBLtSZMNGc.mp3`,
      })
      .promise();

    return new StreamableFile(object.Body as Buffer);
  }
}
