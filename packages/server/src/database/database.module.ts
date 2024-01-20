import {Global, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: 'osucad',
      password: 'osucad',
      database: 'osucad2',
      entities: [],
      synchronize: true,
    }),
  ],
  exports: [
    TypeOrmModule,
  ],
})
export class DatabaseModule {
}
