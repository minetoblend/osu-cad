import {Controller, Get, Param, Req, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {JwtAuthService} from "../auth/jwt.auth.service";

@Controller('user')
export class UserController {

    constructor(private jwtAuthService: JwtAuthService) {
    }

    @Get('/me')
    @UseGuards(AuthGuard('jwt'))
    me(@Req() req) {
        const {accessToken} = this.jwtAuthService.login(req.user);

        return {
            user: req.user,
            token: accessToken
        }
    }

    @Get('/:id/avatar')
    getAvatarUrl(@Param('id') id: string) {

        return {}
    }


}
