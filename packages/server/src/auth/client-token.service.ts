import { Injectable } from '@nestjs/common';
import { UserEntity } from '../users/user.entity';
import * as crypto from 'node:crypto';
import { Repository } from 'typeorm';
import { ClientTokenEntity } from './client-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CLIENT_TOKEN_EXPIRATION,
  CLIENT_TOKEN_STRING_LENGTH,
} from './constants';

@Injectable()
export class ClientTokenService {
  constructor(
    @InjectRepository(ClientTokenEntity)
    private readonly repository: Repository<ClientTokenEntity>,
  ) {}

  async createToken(user: UserEntity) {
    const tokenBytes = crypto.randomBytes(CLIENT_TOKEN_STRING_LENGTH / 2);

    const token = this.repository.create({
      user,
      token: tokenBytes.toString('hex'),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + CLIENT_TOKEN_EXPIRATION),
    });

    await this.repository.save(token);

    return token.token;
  }

  async validateToken(token: string): Promise<UserEntity | null> {
    const clientToken = await this.repository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!clientToken) {
      return null;
    }

    if (clientToken.expiresAt < new Date()) {
      await this.repository.delete(clientToken);
      return null;
    }

    if (clientToken.usedAt) {
      return null;
    }

    clientToken.usedAt = new Date();

    await this.repository.save(clientToken);

    return clientToken.user;
  }
}
