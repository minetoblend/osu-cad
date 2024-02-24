import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import { UserService } from './user.service';
import { OsuApiService } from '../osu/osu-api.service';

@Controller('api/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly osuApiService: OsuApiService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getOwnUser(@Req() req: Request) {
    const user = await this.userService.findById(req.session.user.id);
    return user.getInfo();
  }

  @Get('search')
  @UseGuards(AuthGuard)
  async searchUsers(@Query('query') query: string) {
    if (typeof query !== 'string') {
      throw new BadRequestException('Invalid query');
    }

    const users = await this.osuApiService.lookupUser(query);

    return users;
  }
}
