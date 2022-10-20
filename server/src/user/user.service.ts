import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User} from './user.entity';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {
    }

    async getOrCreateFromProfile(profile: any, accessToken: string, refreshToken: string) {
        const profileId = profile.id as number

        let user = await this.userRepository.findOne({where: {profileId}})

        if (user) {
            console.log(profile)

            user.displayName = profile.displayName
            user.avatarUrl = profile._json.avatar_url
            user.accessToken = accessToken
            user.refreshToken = refreshToken
            await this.userRepository.save(user)

            return user
        } else
            user = new User()

        user.profileId = profileId
        user.displayName = profile.displayName
        user.avatarUrl = profile._json.avatar_url
        user.accessToken = accessToken
        user.refreshToken = refreshToken
        await this.userRepository.save(user)
        return user
    }

    findById(id: number) {
        return this.userRepository.findOne({where: {id}})
    }
}
