import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { BeatmapImportService } from "./beatmap-import.service";
import { FileInterceptor } from "@nestjs/platform-express";
import "multer";
import { AuthGuard } from "../auth/auth.guard";
import { Request, Response } from "express";
import { BeatmapService } from "./beatmap.service";
import { MapsetInfo } from "@osucad/common";
import { BeatmapExportService } from "./beatmap-export.service";

@Controller("api/mapsets")
export class MapsetController {
  constructor(
    private readonly beatmapImportService: BeatmapImportService,
    private readonly beatmapService: BeatmapService,
    private readonly beatmapExportService: BeatmapExportService,
  ) {}

  @Get("/own")
  @UseGuards(AuthGuard)
  async getOwnMapsets(@Req() request: Request) {
    const mapsets = await this.beatmapService.findMapsetsByCreator(
      request.session.user!.id,
    );

    return mapsets.map<MapsetInfo>((mapset) => mapset.getInfo());
  }

  @Get("/feed")
  @UseGuards(AuthGuard)
  async getFeed(@Req() request: Request) {
    const sessions = await this.beatmapService.findLastEditedBeatmaps(
      request.session.user!,
    );

    return sessions.map((session) => {
      const beatmap = session.beatmap;
      const mapset = beatmap.mapset;
      return {
        date: session.endDate,
        beatmap: beatmap.getInfo(),
        mapset: {
          id: mapset.id,
          title: mapset.title,
          artist: mapset.artist,
          tags: mapset.tags,
          createdAt: mapset.createdAt.toISOString(),
          updatedAt: mapset.updatedAt.toISOString(),
          backgroundPath: mapset.background,
          creator: mapset.creator.getInfo(),
        },
      };
    });
  }

  @Post("import")
  @UseInterceptors(FileInterceptor("file"))
  @UseGuards(AuthGuard)
  async import(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 50 })
        .build({
          exceptionFactory: (error) => {
            console.log(error);
            return error;
          },
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Req() request: Request,
  ) {
    const mapset = await this.beatmapImportService.importOsz(
      file.buffer,
      request.session.user!.id,
    );
    if (!mapset) throw new Error("Failed to import mapset");
    return mapset.getInfo();
  }

  @Get(":id/export")
  @UseGuards(AuthGuard)
  async export(
    @Req() request: Request,
    @Param("id") id: string,
    @Res() res: Response,
  ) {
    const mapset = await this.beatmapService.findMapsetById(id);
    if (!mapset) return res.sendStatus(404);

    const archive = await this.beatmapExportService.convertMapset(mapset);
    res.header("Content-Type", "application/zip");
    res.header(
      "Content-Disposition",
      `attachment; filename="${mapset.title}.osz"`,
    );
    archive.generateNodeStream().pipe(res);
  }

  @Get(":id/files/*")
  @UseGuards(AuthGuard)
  async getFile(
    @Req() request: Request,
    @Param("id") id: string,
    @Res() response: Response,
  ) {
    if (!(await this.beatmapService.mapsetExists(id)))
      throw new Error("Mapset not found");

    const path = decodeURIComponent(
      request.path.split("/files/").slice(1).join("/"),
    );

    if (path.match(/\.\.\//g) !== null) {
      return response.sendStatus(400);
    }

    if (path.length === 0) return response.sendStatus(400);

    try {
      const buffer = this.beatmapService.getFileContents(id, path);
      if (!buffer) {
        return response.sendStatus(404);
      }

      response.writeHead(200, [
        ["Content-Length", buffer.length.toString()],
        ["Content-Type", "application/octet-stream"],
        ["Cache-Control", "public, max-age=31536000"],
      ]);
      response.write(buffer);
      response.end();
    } catch (e) {
      console.log(e);
      response.status(404).send("File not found");
    }
  }
}
