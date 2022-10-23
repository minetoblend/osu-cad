import {Controller, Get, Req, Res, UseGuards} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {JwtAuthService} from "./jwt.auth.service";
import {Response} from "express";


@Controller('auth')
export class AuthController {

    constructor(private jwtAuthService: JwtAuthService,) {

    }

    @Get('osu')
    @UseGuards(AuthGuard('osu'))
    //@Redirect('http://osucad.com:8081/logged-in', 302)
    login(
        @Req() req,
        @Res() res: Response
    ) {
        const {accessToken} = this.jwtAuthService.login(req.user);
        res.cookie('jwt', accessToken);
        res.redirect(302, `http://${req.hostname}:8081/logged-in`)
    }

}