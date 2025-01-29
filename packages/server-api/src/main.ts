import config from 'config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { createPassport } from './passport';
import { createApi } from './routes';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
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
