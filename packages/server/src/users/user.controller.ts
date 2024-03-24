import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import { UserService } from './user.service';
import { OsuApiService } from '../osu/osu-api.service';
import { AssetQuotaService } from '../assets/asset-quota.service';

@Controller('api/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly osuApiService: OsuApiService,
    private readonly assetQuotaService: AssetQuotaService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getOwnUser(@Req() req: Request) {
    const user = await this.userService.findById(req.session.user!.id);
    if (!user) {
      throw new InternalServerErrorException();
    }
    return user.getInfo();
  }

  @Get('me/quota')
  @UseGuards(AuthGuard)
  async getQuota(@Req() req: Request) {
    const user = req.session.user;

    const totalStorageUsed = await this.assetQuotaService.getTotalStorageUsed(
      user!.id,
    );

    return {
      totalStorageUsed,
      storageLimit: 1024 * 1024 * 1024, // 1GB
    };
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
