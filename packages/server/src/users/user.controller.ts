import {Controller, Get, Req, UseGuards} from "@nestjs/common";
import {AuthGuard} from "../auth/auth.guard";
import {Request} from "express";
import {UserService} from "./user.service";

@Controller('api/users')
export class UserController {

  constructor(
      private readonly userService: UserService
  ) {
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getOwnUser(@Req() req: Request) {
    const user = await this.userService.findById(req.session.user.id);
    return user.getInfo();
  }
}