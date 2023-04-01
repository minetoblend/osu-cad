import { IPreferences } from '@osucad/common';
import { User } from '../../users/user.entity';
import { EditorPreferences } from './editor.preferences.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class EditorPreferencesService {
  constructor(
    @InjectRepository(EditorPreferences)
    private readonly editorPreferencesRepository: Repository<EditorPreferences>,
  ) {}

  async getEditorPreferences(user: User): Promise<EditorPreferences> {
    const preferences = await this.editorPreferencesRepository.findOne({
      where: { userId: user.id },
    });
    if (preferences) return preferences;
    const newPreferences = this.editorPreferencesRepository.create({
      userId: user.id,
    });
    return this.editorPreferencesRepository.save(newPreferences);
  }

  async updateEditorPreferences(
    user: User,
    preferences: IPreferences,
  ): Promise<EditorPreferences> {
    const currentPreferences = await this.getEditorPreferences(user);
    const newPreferences = this.editorPreferencesRepository.merge(
      currentPreferences,
      preferences,
    );
    return this.editorPreferencesRepository.save(newPreferences);
  }
}
