import type { Provider } from 'nconf';
import type { DataSource } from 'typeorm';
import { User } from '../entities/User';

export class UserService {
  constructor(
    readonly config: Provider,
    readonly db: DataSource,
  ) {
  }

  readonly repository = this.db.getRepository(User);

  findById(id: number) {
    return this.repository.findOneBy({ id });
  }

  upsertUser(
    id: number,
    username: string,
  ): Promise<User> {
    return this.db.transaction('SERIALIZABLE', async (em) => {
      const repository = em.getRepository(User);

      let user = await repository.findOneBy({ id });

      if (!user) {
        user = repository.create({
          id,
          username,
        });

        user = await repository.save(user);
      }

      return user;
    });
  }

  async resetCooldown(user: User) {
    user.lastObjectPlaced = Date.now();

    return await this.repository.save(user);
  }

  getCooldown(user: User) {
    const placementCooldown = this.config.get('placementCooldown') * 1000;

    return user.lastObjectPlaced !== null
      ? (user.lastObjectPlaced + placementCooldown) - Date.now()
      : 0;
  }
}
