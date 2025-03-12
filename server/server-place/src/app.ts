import type { NextFunction, Request, Response } from 'express';
import type { Provider } from 'nconf';
import type { PlaceServerResources } from './PlaceServerResources';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import safeStringify from 'json-stringify-safe';
import morgan from 'morgan';
import passport from 'passport';
import { setupPassport } from './passport';
import { create as createRoutes } from './routes';

export function create(
  config: Provider,
  resources: PlaceServerResources,
) {
  const requestSize = config.get('server:jsonSize');

  const app = express();

  app.set('trust proxy', 1);

  app.use(compression());
  app.use(morgan(config.get('logger:morganFormat')));
  app.use(express.json({ limit: requestSize }));

  app.use(cors());

  app.use(session({
    secret: 'foo bar',
  }));

  setupPassport(config, resources.userService);

  app.use(passport.initialize());
  app.use(passport.session());

  const routes = createRoutes(config, resources);

  app.use(routes.auth);
  app.use(routes.users);
  app.use(routes.beatmap);
  app.use(routes.place);

  app.get('/', (req, res) => {
    res.status(200).send('osucad place. Find out more at https://github.com/minetoblend/osu-cad/tree/master/server/place-server');
  });

  app.use((req, res, next) => {
    const err = new Error('Not Found');
    (err as any).status = 404;
    next(err);
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500);
    res.json({ error: safeStringify(err), message: err.message });
  });

  return app;
}
