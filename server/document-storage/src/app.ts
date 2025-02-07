import type { IDocumentStorage } from '@osucad/multiplayer';
import type { NextFunction, Request, Response } from 'express';
import type { Provider } from 'nconf';
import type { GitService } from './services/GitService';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import safeStringify from 'json-stringify-safe';
import morgan from 'morgan';
import { create as createRoutes } from './routes';

export function create(
  config: Provider,
  documentStorage: IDocumentStorage,
  git: GitService,
) {
  const requestSize = config.get('server:jsonSize');

  const app = express();

  app.set('trust proxy', 1);

  app.use(compression());
  app.use(morgan(config.get('logger:morganFormat')));
  app.use(express.json({ limit: requestSize }));

  const routes = createRoutes(config, documentStorage, git);

  app.use(cors());
  app.use(routes.storage);
  app.use(routes.git.blobs);
  app.use(routes.git.trees);
  app.use(routes.git.commits);

  app.get('/', (req, res) => {
    res.status(200).send('osucad document storage. Find out more at https://github.com/minetoblend/osu-cad/tree/master/server/document-storage');
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
