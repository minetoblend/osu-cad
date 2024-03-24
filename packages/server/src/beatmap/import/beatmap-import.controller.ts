import {
  BadRequestException,
  Controller,
  ForbiddenException,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Req,
  Sse,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  MessageEvent,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../auth/auth.guard';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { BeatmapImportService } from './beatmap-import.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BeatmapImportJob,
  BeatmapImportProcessor,
  BeatmapImportProgressEvent,
} from './beatmap-import.processor';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BeatmapImportProgress } from '@osucad/common';

@Controller('api/beatmaps/import')
export class BeatmapImportController {
  constructor(
    private readonly importService: BeatmapImportService,
    private readonly eventEmitter: EventEmitter2,
    @InjectQueue(BeatmapImportProcessor.queueName)
    private readonly queue: Queue<BeatmapImportJob>,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { dest: 'files/uploads/' }))
  @UseGuards(AuthGuard)
  async importBeatmap(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 50 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Req() request: Request,
  ) {
    const job = await this.importService.importBeatmap(
      request.session.user!.id,
      file.path,
    );

    return {
      status: 'queued',
      job: job.id,
    };
  }

  @Sse('events/:id')
  @UseGuards(AuthGuard)
  getEvents(
    @Req() req: Request,
    @Param('id') id: string | unknown,
  ): Observable<MessageEvent> {
    const user = req.session.user!;
    if (typeof id !== 'string') {
      throw new BadRequestException();
    }

    return new Observable((observer) => {
      const onProgress = (userId: number, progress: BeatmapImportProgress) => {
        if (userId !== user.id) return;
        observer.next({
          data: JSON.stringify(progress),
        });
      };

      observer.add(() => {
        this.eventEmitter.removeListener(
          BeatmapImportProgressEvent,
          onProgress,
        );
      });

      (async () => {
        const job = await this.queue.getJob(id);

        if (!job) {
          observer.error(new BadRequestException());
          observer.complete();
          return;
        }

        if (job.data.userId !== user.id) {
          observer.error(new ForbiddenException());
          observer.complete();
          return;
        }

        this.eventEmitter.on(BeatmapImportProgressEvent, onProgress);

        const progress = await job.progress();
        if (progress) {
          observer.next(progress);
        }
      })();
    });
  }
}
