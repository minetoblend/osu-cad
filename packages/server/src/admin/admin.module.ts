import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from '../users/user.module';
import { EditorModule } from '../editor/editor.module';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [UserModule, EditorModule, AssetsModule],
  controllers: [AdminController],
  providers: [],
})
export class AdminModule {}
