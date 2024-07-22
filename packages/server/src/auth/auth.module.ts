import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '../users/user.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientTokenEntity } from './client-token.entity';
import { ClientTokenService } from './client-token.service';
import { UserEntity } from '../users/user.entity';

@Module({
  imports: [
    HttpModule,
    UserModule,
    ConfigModule,
    TypeOrmModule.forFeature([ClientTokenEntity, UserEntity]),
  ],
  controllers: [AuthController],
  providers: [ClientTokenService],
})
export class AuthModule {}
