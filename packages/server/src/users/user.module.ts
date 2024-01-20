import {Module} from "@nestjs/common";
import {UserService} from "./user.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "./user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {
}
