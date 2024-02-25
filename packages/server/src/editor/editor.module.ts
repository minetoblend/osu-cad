import { forwardRef, Module } from '@nestjs/common';
import { EditorGateway } from './editor.gateway';
import { EditorRoomService } from './editor-room.service';
import { BeatmapModule } from '../beatmap/beatmap.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EditorSessionEntity } from './editor-session.entity';
import { UserModule } from '../users/user.module';
import { EditorRoomEntity } from './editor-room.entity';

@Module({
  imports: [
    forwardRef(() => BeatmapModule),
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([EditorSessionEntity, EditorRoomEntity]),
  ],
  providers: [EditorGateway, EditorRoomService],
  exports: [EditorRoomService],
})
export class EditorModule {}
