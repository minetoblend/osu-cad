import Redis from 'ioredis';

export interface RedisConfig {
  host: string;
  port: number;
}

export function createRedis(config: RedisConfig) {
  const redis = new Redis();

  redis.on('connect', () => console.log('Connected to redis'));

  redis.on('message', console.log);

  return redis;
}
