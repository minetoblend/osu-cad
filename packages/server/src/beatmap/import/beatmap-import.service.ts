import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  BeatmapImportJob,
  BeatmapImportProcessor,
} from './beatmap-import.processor';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BeatmapImportService {
  constructor(
    @InjectQueue(BeatmapImportProcessor.queueName)
    private readonly queue: Queue<BeatmapImportJob>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async importBeatmap(userId: number, path: string) {
    return await this.queue.add({ userId, path });
  }
}
