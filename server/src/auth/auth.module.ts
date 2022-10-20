import {Global, Module} from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import {AuthService} from './auth.service';
import {OsuStrategy} from './osu.strategy';
import {JwtAuthService} from './jwt.auth.service'
import {JwtModule} from '@nestjs/jwt';
import {JwtAuthStrategy} from './jwt.strategy';
import {AuthController} from "./auth.controller";

@Global()
@Module({
    imports: [PassportModule,
        JwtModule.registerAsync({
            useFactory: async () => {
                return {
                    secret: process.env.JWT_SECRET,
                    signOptions: {
                        expiresIn: 86400,
                    },
                };
            },
        }),
    ],
    providers: [AuthService, OsuStrategy, JwtAuthService, JwtAuthStrategy],
    exports: [JwtAuthService],
    controllers: [AuthController]
})
export class AuthModule {
}
