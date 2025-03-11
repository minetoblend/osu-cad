import type { IDocumentStorage } from '@osucad/multiplayer';
import { Router } from 'express';
import { handleResponse } from '../utils';

export function create(storage: IDocumentStorage) {
  const router = Router();

  router.get('/:documentId', (request, response) => {
    const documentId = request.params.documentId;

    const documentP = storage.getDocument(documentId);

    handleResponse(documentP, response, false);
  });

  router.post('', (request, response) => {
    const summary = request.body.summary;
    const id = crypto.randomUUID();

    const sequenceNumber = request.body.sequenceNumber;

    const documentP = storage.createDocument(
      id,
      summary,
      sequenceNumber,
    );

    handleResponse(documentP, response, false, 201);
  });

  return router;
}
