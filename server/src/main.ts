import {NestFactory, Reflector} from '@nestjs/core';
import {AppModule} from './app.module';
import {ClassSerializerInterceptor} from "@nestjs/common";
import {json} from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
    app.use(json({ limit: '50mb' }))
    app.enableCors({
        origin: ['http://osucad.com:8081'],
        credentials: true
    })
    await app.listen(3000);
}

bootstrap();
