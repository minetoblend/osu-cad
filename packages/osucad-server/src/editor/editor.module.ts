import { EditorPreferencesModule } from './preferences/editor.preferences.module';
import { EditorUnisonService } from './editor.unison.service';
import { EditorGateway } from './editor.gateway';
import { Module } from '@nestjs/common';
import { EditorController } from './editor.controller';
import { JwtModule } from '@nestjs/jwt';
import { EditorService } from './editor.service';
import { PulsarModule } from 'src/pulsar/pulsar.module';
import { ScheduleModule } from '@nestjs/schedule';
import { v4 as uuid } from 'uuid';
import { BeatmapModule } from 'src/beatmap/beatmap.module';

@Module({
  imports: [
    JwtModule.register({
      // TODO: get this from config service
      secret: uuid(),
    }),
    PulsarModule,
    ScheduleModule.forRoot(),
    EditorPreferencesModule,
    BeatmapModule,
  ],
  controllers: [EditorController],
  providers: [EditorGateway, EditorUnisonService, EditorService],
})
export class EditorModule {}
