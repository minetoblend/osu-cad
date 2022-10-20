import {Injectable} from '@nestjs/common';
import {UserService} from '../user/user.service'

@Injectable()
export class AuthService {

    constructor(private userService: UserService) {

    }

    async validateUser(
        accessToken: string,
        refreshToken: string,
        profile,
    ) {
        return this.userService.getOrCreateFromProfile(profile, accessToken, refreshToken)
    }

}
