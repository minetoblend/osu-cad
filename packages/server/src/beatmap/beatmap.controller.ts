import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { BeatmapPermissionsService } from './beatmap-permissions.service';
import { BeatmapService } from './beatmap.service';
import { BeatmapAccess, BeatmapInfo } from '@osucad/common';
import { AuthGuard } from '../auth/auth.guard';
import z from 'zod';
import { BeatmapEntity } from './beatmap.entity';
import { AssetsService } from '../assets/assets.service';
import { BeatmapTransformer } from './beatmapTransformer';
import { ImagesService } from '../assets/images.service';

@Controller('api/beatmaps')
export class BeatmapController {
  constructor(
    private readonly permissionService: BeatmapPermissionsService,
    private readonly beatmapService: BeatmapService,
    private readonly assetsService: AssetsService,
    private readonly beatmapTransformer: BeatmapTransformer,
    private readonly imagesService: ImagesService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getBeatmaps(
    @Req() req: Request,
    @Query('filter') filter: 'own' | 'shared-with-me' | 'all' = 'all',
    @Query('sort') sort: 'artist' | 'title' | 'recent' = 'recent',
    @Query('search') search?: string,
  ): Promise<(BeatmapInfo & { lastEdited: string })[]> {
    const user = req.session.user;

    if (!['own', 'shared-with-me', 'all'].includes(filter)) {
      throw new BadRequestException('Invalid filter value');
    }

    if (!['artist', 'title', 'recent'].includes(sort)) {
      throw new BadRequestException('Invalid sort value');
    }

    if (search && typeof search !== 'string') {
      throw new BadRequestException('Invalid search value');
    }

    const beatmaps = await this.beatmapService.getRecentBeatmaps(
      user!.id,
      filter,
      sort,
      search?.trim().toLowerCase(),
    );

    return await Promise.all(
      beatmaps.map(async (entity) => {
        const lastEdited = '';

        return {
          id: entity.uuid,
          title: entity.mapset.title,
          artist: entity.mapset.artist,
          version: entity.name,
          lastEdited,
          access: entity.access,
          isOwner: entity.mapset.creator.id === user?.id,
          creator: entity.mapset.creator.getInfo(),
          links: {
            edit: `/edit/${entity.shareId}`,
            view: `/beatmaps/${entity.uuid}`,
            thumbnail:
              this.imagesService.getImageUrl(entity.thumbnailId, 'thumbnail') ??
              null,
          },
        };
      }),
    );
  }

  @Get('/access')
  async getAccess(
    @Req() req: Request,
    @Query('id') id?: string,
    @Query('shareKey') shareKey?: string,
  ) {
    const user = req.session.user;

    let beatmap: BeatmapEntity | null = null;

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

    const access = user
      ? await this.permissionService.getAccess(beatmap, user?.id)
      : BeatmapAccess.None;

    return {
      access,
      beatmap: {
        id: beatmap.uuid,
        title: beatmap.mapset.title,
        artist: beatmap.mapset.artist,
        access: beatmap.access,
        version: beatmap.name,
        lastEdited: '',
        isOwner: beatmap.mapset.creator.id === user?.id,
        links: {
          edit: `/edit/${beatmap.shareId}`,
          view: `/beatmaps/${beatmap.uuid}`,
          thumbnail: this.imagesService.getImageUrl(
            beatmap.thumbnailId,
            'thumbnail',
          ),
        },
      } as BeatmapInfo,
    };
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  async findById(@Req() req: Request, @Param('id') id: string) {
    const beatmap = await this.beatmapService.findBeatmapByUuid(id);
    if (!beatmap) {
      throw new NotFoundException();
    }
    const access = await this.permissionService.getAccess(
      beatmap,
      req.session.user!.id,
    );

    if (access < BeatmapAccess.View) {
      throw new ForbiddenException();
    }

    return await this.beatmapTransformer.transform(beatmap);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  async deleteBeatmap(@Req() req: Request, @Param('id') id: string) {
    const user = req.session.user!;
    const beatmap = await this.beatmapService.findBeatmapByUuid(id);
    if (!beatmap) {
      throw new NotFoundException();
    }

    const access = await this.permissionService.getAccess(beatmap, user.id);

    if (access < BeatmapAccess.MapsetOwner) {
      throw new ForbiddenException();
    }

    await this.beatmapService.deleteBeatmap(beatmap);

    return { success: true };
  }

  @Get('/:id/access/settings')
  @UseGuards(AuthGuard)
  async getAccessSettings(@Req() req: Request) {
    const user = req.session.user!;
    const beatmap = await this.beatmapService.findBeatmapByUuid(req.params.id);
    if (!beatmap) {
      return { access: BeatmapAccess.None };
    }

    const access = await this.permissionService.getAccess(beatmap, user.id);

    if (access < BeatmapAccess.MapsetOwner) {
      throw new ForbiddenException();
    }

    const participants = await this.permissionService.getParticipants(beatmap);

    return {
      beatmap: await this.beatmapTransformer.transform(beatmap),
      access: beatmap.access,
      participants: participants.map((it) => {
        return {
          user: {
            id: it.user.id,
            username: it.user.username,
            avatarUrl: it.user.avatarUrl,
          },
          access: it.access,
        };
      }),
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

  @Post('/:id/participants/add')
  @UseGuards(AuthGuard)
  async addParticipants(
    @Req() req: Request,
    @Body() body: { user: number; access: BeatmapAccess },
  ) {
    const shape = z.object({
      users: z.array(z.number()),
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

    for (const user of parsedBody.data.users) {
      await this.permissionService.setAccess(
        beatmap,
        user,
        parsedBody.data.access,
      );
    }

    const participants = await this.permissionService.getParticipants(beatmap);

    return {
      beatmap: await this.beatmapTransformer.transform(beatmap),
      participants: participants.map((it) => {
        return {
          user: {
            id: it.user.id,
            username: it.user.username,
            avatarUrl: it.user.avatarUrl,
          },
          access: it.access,
        };
      }),
    };
  }
}
