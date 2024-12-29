import type { UpdateHandler } from './UpdateHandler';

let currentUpdateHandler: UpdateHandler | null = null;

export function setCurrentUpdateHandler(handler: UpdateHandler | null) {
  currentUpdateHandler = handler;
}

export function getCurrentUpdateHandler() {
  return currentUpdateHandler;
}
