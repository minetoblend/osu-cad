import { Module } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';
import { UserModule } from '../users/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PreferencesSchema } from './preferences.document';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      {
        name: 'preferences',
        schema: PreferencesSchema,
      },
    ]),
  ],
  providers: [PreferencesService],
  controllers: [PreferencesController],
})
export class PreferencesModule {}
