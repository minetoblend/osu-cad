import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { BeatmapPermissionsService } from './beatmap-permissions.service';
import { BeatmapService } from './beatmap.service';
import { BeatmapAccess } from '@osucad/common';
import { AuthGuard } from '../auth/auth.guard';
import z from 'zod';
import { BeatmapEntity } from './beatmap.entity';

@Controller('api/beatmaps')
export class BeatmapController {
  constructor(
    private readonly permissionService: BeatmapPermissionsService,
    private readonly beatmapService: BeatmapService,
  ) {}

  @Get('/access')
  async getAccess(
    @Req() req: Request,
    @Query('id') id?: string,
    @Query('shareKey') shareKey?: string,
  ) {
    const user = req.session.user;

    let beatmap: BeatmapEntity | null = null;

    console.log(id, shareKey);

    if (id) {
      beatmap = await this.beatmapService.findBeatmapByUuid(id);
    } else if (shareKey) {
      beatmap = await this.beatmapService.findBeatmapByShareKey(shareKey);
    } else {
      throw new BadRequestException(
        'Either id or shareId must be provided as a query parameter',
      );
    }

    if (!beatmap) {
      throw new NotFoundException();
    }

    if (!user) {
      return {
        access: BeatmapAccess.None,
      };
    }

    return {
      access: await this.permissionService.getAccess(beatmap, user.id),
    };
  }

  @Get('/:id')
  async findById(@Req() req: Request, @Param('id') id: string) {
    const beatmap = await this.beatmapService.findBeatmapByUuid(id);
    if (!beatmap) {
      throw new NotFoundException();
    }
    const access = await this.permissionService.getAccess(
      beatmap,
      req.session.user?.id,
    );

    if (access < BeatmapAccess.View) {
      throw new ForbiddenException();
    }

    return beatmap.getInfo();
  }

  @Get('/:id/access/settings')
  @UseGuards(AuthGuard)
  async getAccessSettings(@Req() req: Request) {
    const user = req.session.user;
    const beatmap = await this.beatmapService.findBeatmapByUuid(req.params.id);
    if (!beatmap) {
      return { access: BeatmapAccess.None };
    }

    const access = await this.permissionService.getAccess(beatmap, user.id);

    if (access < BeatmapAccess.MapsetOwner) {
      throw new ForbiddenException();
    }

    return {
      beatmap: beatmap.getInfo(),
      access: beatmap.access,
    };
  }

  @Put('/:id/access')
  @UseGuards(AuthGuard)
  async setAccess(
    @Req() req: Request,
    @Body() body: { access: BeatmapAccess },
  ) {
    const shape = z.object({
      access: z.union([
        z.literal(BeatmapAccess.None),
        z.literal(BeatmapAccess.View),
        z.literal(BeatmapAccess.Modding),
        z.literal(BeatmapAccess.Edit),
      ]),
    });

    const parsedBody = shape.safeParse(body);

    if (!parsedBody.success) {
      throw new BadRequestException();
    }

    const user = req.session.user;
    const beatmap = await this.beatmapService.findBeatmapByUuid(req.params.id);
    if (!beatmap || !user) {
      throw new NotFoundException();
    }

    const accessLevel = await this.permissionService.getAccess(
      beatmap,
      user.id,
    );

    if (accessLevel < BeatmapAccess.MapsetOwner) {
      throw new ForbiddenException();
    }

    await this.beatmapService.setAccess(beatmap, parsedBody.data.access);

    return { access: parsedBody.data.access };
  }
}
