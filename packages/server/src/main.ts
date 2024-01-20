import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {join} from "path";
import {NestExpressApplication} from "@nestjs/platform-express";
import * as exphbs from "express-handlebars";
import * as expressSession from "express-session";
import RedisStore from "connect-redis";
import {createClient} from "redis";
import {SessionIoAdapter} from "./io.adapter";


async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(AppModule);

  const redisClient = await createClient().connect();

  const session = expressSession({
    secret: "session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 },
    store: new RedisStore({
      client: redisClient,
      prefix: "osucad:",
    }),
  });

  app.use(session);
  app.useWebSocketAdapter(new SessionIoAdapter(app, session));

  app.useStaticAssets(join(__dirname, "..", "public"));
  app.setBaseViewsDir(join(__dirname, "..", "views"));

  const helpers = {
    toJson: (context) => JSON.stringify(context),
  };
  const hbs = exphbs.create({
    defaultLayout: false,
    helpers,
  });

  app.engine("hbs", hbs.engine);
  app.setViewEngine("hbs");


  await app.listen(3000);
}

bootstrap();
