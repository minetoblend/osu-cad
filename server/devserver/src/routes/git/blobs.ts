import type { GitService } from '../../services/GitService';
import { Router } from 'express';
import { handleResponse } from '../utils';

export function create(git: GitService) {
  const router = Router();

  router.post('/storage/:documentId/git/blobs', (request, response) => {
    const blobP = git.createBlob(request.body);

    handleResponse(blobP, response, false, 201);
  });

  router.get('/storage/:documentId/git/blobs/:sha', (request, response) => {
    const blobP = git.getBlob(request.params.sha);

    handleResponse(blobP, response, true);
  });

  router.get('/storage/:documentId/git/blobs/:sha/raw', (request, response) => {
    const blobP = git.getBlobRaw(request.params.sha);

    blobP.then((blob) => {
      response.setHeader('Cache-Control', 'public, max-age=31536000');
      response
        .status(200)
        .write(blob, () => response.end());
    }, (error) => {
      response.status(400).json(error);
    });
  });

  return router;
}
