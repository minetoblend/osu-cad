import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from '../users/user.module';
import { EditorModule } from '../editor/editor.module';

@Module({
  imports: [UserModule, EditorModule],
  controllers: [AdminController],
  providers: [],
})
export class AdminModule {}
