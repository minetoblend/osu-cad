import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {User} from '../user/user.entity';
import {JwtPayload} from './jwt.strategy';

@Injectable()
export class JwtAuthService {
  constructor(private jwtService: JwtService) {}

  login(user: User) {
    const payload: JwtPayload = {
      id: user.id,
      displayName: user.displayName,
      profileId: user.profileId,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}