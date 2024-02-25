import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    if (!request.session.user) {
      return false;
    }

    const user = await this.userService.findById(request.session.user.id);
    if (!user) {
      return false;
    }

    return !!user.isAdmin;
  }
}
