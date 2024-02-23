import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { HttpModule } from "@nestjs/axios";
import { UserModule } from "../users/user.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [HttpModule, UserModule, ConfigModule],
  controllers: [AuthController],
})
export class AuthModule {}
