import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IOsuProfileInformation } from '../auth/interfaces';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private readonly auditService: AuditService,
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
    await this.repository.save(user);

    await this.auditService.record(user, 'user.create', {});

    return user;
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
