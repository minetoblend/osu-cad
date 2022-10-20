import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {parse as parseCookies} from 'cookie';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {UserService} from '../user/user.service';

export interface JwtPayload {
  id: number;
  displayName: string;
  profileId: number;
}

const extractJwtFromCookie = (req) => {
  let token = null;
  if (req?.headers?.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies.jwt;
  }

  return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return await this.userService.findById(payload.id);
  }
}