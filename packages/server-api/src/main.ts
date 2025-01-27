import config from 'config';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import { createPassport } from './passport';
import { createApi } from './routes';

const app = express();

app.use(cookieParser());
app.use(session({
  secret: config.get<string>('session.secret'),
  resave: false,
  saveUninitialized: true,
  cookie: {},
}));
app.use(createPassport());

app.use(createApi());

const port = config.get<number>('deployment.port');

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
