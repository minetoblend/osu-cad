import { AuthGuard } from '../auth/auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  @Get('/me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    const user = req.session.user;

    return user;
  }
}
