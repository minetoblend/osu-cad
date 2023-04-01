import { EditorPreferencesService } from './editor.preferences.service';
import { EditorPreferencesController } from './editor.preferences.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EditorPreferences } from './editor.preferences.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EditorPreferences])],
  controllers: [EditorPreferencesController],
  providers: [EditorPreferencesService],
})
export class EditorPreferencesModule {}
