import type { Provider } from 'nconf';
import * as fs from 'node:fs';
import { Router } from 'express';
import git from 'isomorphic-git';
import { handleResponse } from './utils';

export interface ICreateBlobParams {
  content: string;
  encoding: 'utf-8' | 'base64';
}

export interface IBlob {
  sha: string;
  size: number;
  content: string;
  encoding: 'utf-8' | 'base64';
}

async function createBlob(
  config: Provider,
  body: ICreateBlobParams,
) {
  console.log(body);

  const buffer = Buffer.from(body.content, body.encoding);

  const sha = await git.writeBlob({
    fs,
    dir: config.get('storage'),
    blob: buffer,
  });

  return {
    sha,
  };
}

async function getBlob(
  config: Provider,
  sha: string,
): Promise<IBlob> {
  const gitObj = await git.readBlob({
    fs,
    dir: config.get('storage'),
    oid: sha,
  });

  return {
    sha,
    size: gitObj.blob.length,
    content: Buffer.from(gitObj.blob).toString('base64'),
    encoding: 'base64',
  };
}

export function create(config: Provider) {
  const router = Router();

  router.post('/document/:documentId/blobs', (request, response) => {
    const blobP = createBlob(config, request.body);

    handleResponse(blobP, response, false, 201);
  });

  router.get('/document/:documentId/blobs/:sha', (request, response) => {
    const blobP = getBlob(config, request.params.sha);

    handleResponse(blobP, response, true);
  });

  router.get('/document/:documentId/blobs/:sha/raw', (request, response) => {
    const blobP = getBlob(config, request.params.sha);

    blobP.then((blob) => {
      response.setHeader('Cache-Control', 'public, max-age=31536000');
      response
        .status(200)
        .write(Buffer.from(blob.content, 'base64'), () => response.end());
    }, (error) => {
      response.status(400).json(error);
    });
  });

  return router;
}
