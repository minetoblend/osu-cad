import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import 'multer';
import { AuthGuard } from '../auth/auth.guard';
import { Request, Response } from 'express';
import { BeatmapExportService } from './beatmap-export.service';
import { AssetsService } from '../assets/assets.service';
import { MapsetTransformer } from './mapset.transformer';
import { MapsetService } from './mapset.service';
import { BeatmapEntity } from './beatmap.entity';
import { BeatmapPermissionsService } from './beatmap-permissions.service';
import { BeatmapAccess } from '@osucad/common';

@Controller('api/mapsets')
export class MapsetController {
  constructor(
    private readonly beatmapExportService: BeatmapExportService,
    private readonly assetsService: AssetsService,
    private readonly mapsetTransformer: MapsetTransformer,
    private readonly mapsetService: MapsetService,
    private readonly beatmapPermissionService: BeatmapPermissionsService,
  ) {}

  @Get('/own')
  @UseGuards(AuthGuard)
  async getOwnMapsets(@Req() request: Request) {
    const mapsets = await this.mapsetService.findByCreatorId(
      request.session.user!.id,
    );

    return Promise.all(
      mapsets.map((mapset) => this.mapsetTransformer.transform(mapset)),
    );
  }

  @Get(':id/export')
  @UseGuards(AuthGuard)
  async export(
    @Req() request: Request,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const mapset = await this.mapsetService.findById(id);
    if (!mapset) return res.sendStatus(404);

    const beatmaps: BeatmapEntity[] = [];

    for (const beatmap of mapset.beatmaps) {
      const access = await this.beatmapPermissionService.getAccess(
        beatmap,
        request.session.user!.id,
      );
      if (access >= BeatmapAccess.View) {
        beatmaps.push(beatmap);
      }
    }

    if (beatmaps.length === 0) return res.sendStatus(403);

    mapset.beatmaps = beatmaps;

    const archive = await this.beatmapExportService.convertMapset(mapset);
    res.header('Content-Type', 'application/zip');
    res.header(
      'Content-Disposition',
      `attachment; filename="${mapset.title}.osz"`,
    );
    archive.generateNodeStream().pipe(res);
  }

  @Get(':id/files')
  @UseGuards(AuthGuard)
  async getFiles(@Param('id') id: string) {
    if (!(await this.mapsetService.exists(id)))
      throw new Error('Mapset not found');

    const mapset = await this.mapsetService.findById(id);

    if (!mapset) {
      throw new NotFoundException();
    }

    const assets = await this.assetsService.getAssetsForBeatmap(mapset);

    return assets.map((asset) => ({
      path: asset.path,
      filesize: asset.asset.filesize,
      url: `/api/mapsets/${id}/files/${encodeURIComponent(asset.path)}`,
    }));
  }

  @Get(':id/files/*')
  @UseGuards(AuthGuard)
  async getFile(
    @Req() request: Request,
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    if (!(await this.mapsetService.exists(id)))
      throw new Error('Mapset not found');

    const path = decodeURIComponent(
      request.path.split('/files/').slice(1).join('/'),
    );

    if (path.match(/\.\.\//g) !== null) {
      return response.sendStatus(400);
    }

    if (path.length === 0) return response.sendStatus(400);

    const mapset = await this.mapsetService.findById(id);

    if (!mapset) {
      return response.sendStatus(404);
    }

    const asset = await this.assetsService.getAsset(mapset, path);

    if (!asset) {
      return response.sendStatus(404);
    }

    const buffer = await this.assetsService.getAssetContent(asset);

    if (!buffer) {
      return response.sendStatus(404);
    }

    return response.contentType('application/octet-stream').send(buffer);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findById(@Req() request: Request, @Param('id') id: string) {
    const mapset = await this.mapsetService.findById(id);
    if (!mapset) throw new Error('Mapset not found');

    if (mapset.creator.id !== request.session.user!.id) {
      throw new ForbiddenException();
    }

    return this.mapsetTransformer.transform(mapset);
  }
}
