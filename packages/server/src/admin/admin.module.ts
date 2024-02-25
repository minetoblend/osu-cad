import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '../users/user.module';
import { EditorModule } from '../editor/editor.module';

@Module({
  imports: [UserModule, EditorModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
