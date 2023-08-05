import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import * as session from 'express-session';
import {v4 as uuid} from 'uuid';
import {createClient} from 'redis';
import RedisStore from 'connect-redis';

import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // origin: 'https://osucad.com',
    origin: 'http://10.25.120.192:5173',
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'If-None-Match'],
  });

  // const redisClient = createClient();
  // await redisClient.connect();

  // const redisStore = new RedisStore({
  //   client: redisClient,
  //   prefix: 'osucad',
  // });
  //
  app.use(
      session({
        // store: redisStore,
        secret: process.env.SESSION_SECRET || uuid(),

        resave: false,
        saveUninitialized: false,
      }),
  );

  await app.listen(3000);
}

bootstrap();
