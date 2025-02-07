import type { IDocumentStorage } from '@osucad/multiplayer';
import { Router } from 'express';
import * as documents from './documents';

export function create(
  documentStorage: IDocumentStorage,
) {
  const router = Router();

  router.use('/documents', documents.create(documentStorage));

  return router;
}
