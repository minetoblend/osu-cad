import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Request, Response } from 'express';
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

  @Get(':id/avatar')
  async getAvatar(@Param('id') id: string, @Res() res: Response) {
    const parsed = parseInt(id);
    if (isNaN(parsed)) throw new BadRequestException('Invalid id');

    const user = await this.userService.findById(parsed);

    if (!user) throw new NotFoundException();

    const response = await fetch(user.avatarUrl);

    if (!response.ok) {
      throw new NotFoundException();
    }

    res.setHeader(
      'Content-Type',
      response.headers.get('Content-Type') ?? 'image/png',
    );
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());

    const buffer = await response.arrayBuffer();

    res.send(Buffer.from(buffer));
  }
}
