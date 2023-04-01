import { preferencesSchema } from './editor.preferences.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { EditorPreferencesService } from './editor.preferences.service';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

@Controller('editor/preferences')
export class EditorPreferencesController {
  constructor(
    private readonly editorPreferencesService: EditorPreferencesService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  getEditorPreferences(@Req() req: Request) {
    return this.editorPreferencesService.getEditorPreferences(
      req.session.user!,
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  updateEditorPreferences(@Req() req: Request, @Body() preferences: unknown) {
    return this.editorPreferencesService.updateEditorPreferences(
      req.session.user!,
      preferencesSchema.parse(preferences),
    );
  }
}
