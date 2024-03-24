import { AxiosError } from 'axios';

export function sanitizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      type: error.name,
      message: error.message,
      code: error instanceof AxiosError ? error.code : undefined,
    };
  }

  return error;
}
