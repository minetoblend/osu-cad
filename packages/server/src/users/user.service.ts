import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IOsuProfileInformation } from '../auth/interfaces';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}
  async findById(id: number): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: {
        id: id,
      },
    });
  }

  async createFromProfile(profile: IOsuProfileInformation) {
    const user = new UserEntity();
    user.id = profile.id;
    user.username = profile.username;
    user.avatarUrl = profile.avatar_url;
    return this.repository.save(user);
  }

  async findOrCreateByProfile(profile: IOsuProfileInformation) {
    let user = await this.findById(profile.id);
    if (!user) {
      user = await this.createFromProfile(profile);
    }
    return user;
  }

  searchUsers(options: { search?: string; offset?: number; limit?: number }) {
    const { search, limit, offset } = options;

    let query = this.repository.createQueryBuilder('user');
    if (search) {
      query = query.where('LOWER(user.username) LIKE :search', {
        search: `%${search}%`,
      });
    }

    return query
      .addOrderBy('user.created', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
  }
}
