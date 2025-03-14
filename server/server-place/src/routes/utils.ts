import type { Response } from 'express';
import type { User } from '../entities/User';

export function handleResponse<T>(
  resultP: Promise<T>,
  response: Response,
  cache: boolean = true,
  status: number = 200,
  handler: (value: T) => void = value => value,
) {
  resultP.then(handler).then(
    (result) => {
      if (cache) {
        response.setHeader('Cache-Control', 'public, max-age=31536000');
      }

      response.status(status).json(result);
    },
    (error) => {
      response.status(400).json(error);
    },
  );
}

export function serializeUser(user: User) {
  const { id, username } = user;

  return { id, username };
}
