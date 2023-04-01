import { IOsuProfileInformation } from '../auth/interfaces';
import { User } from './user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async createFromProfile(profile: IOsuProfileInformation) {
    const user = new User();
    user.id = profile.id;
    user.displayName = profile.username;
    user.avatarUrl = profile.avatar_url;
    return this.userRepository.save(user);
  }

  async findOrCreateByProfile(profile: IOsuProfileInformation) {
    let user = await this.findById(profile.id);
    if (!user) {
      user = await this.createFromProfile(profile);
    }
    return user;
  }
}
