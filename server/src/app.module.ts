import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {BeatmapModule} from './beatmap/beatmap.module';
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserModule} from './user/user.module';
import {AuthModule} from "./auth/auth.module";
import {User} from "./user/user.entity";
import {OsuModule} from './osu/osu.module';
import {Beatmap, BeatmapSet} from "./beatmap/beatmap.entity";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'db',
            username: 'postgres',
            database: 'osucad',
            password: 'localdb',
            synchronize: true,
            entities: [User, Beatmap, BeatmapSet]
        }),
        BeatmapModule,
        UserModule,
        AuthModule,
        OsuModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
