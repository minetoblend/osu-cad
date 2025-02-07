import type { Provider } from 'nconf';
import fs from 'node:fs';
import { Router } from 'express';
import git from 'isomorphic-git';
import { getGitDir, handleResponse } from './utils';

interface ICreateCommitParams {
  message: string;
  tree: string;
  parents: string[];
  author: IAuthor;
}

export interface IAuthor {
  name: string;
  email: string;
  // ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ
  date: string;
}

async function createCommit(
  config: Provider,
  params: ICreateCommitParams,
) {
  return await git.commit({
    fs,
    dir: getGitDir(config),
    tree: params.tree,
    message: params.message,
    parent: params.parents,
    author: params.author,
    committer: params.author,
  });
}

async function getCommit(
  config: Provider,
  sha: string,
) {
  const commit = await git.readCommit({
    fs,
    dir: getGitDir(config),
    oid: sha,
  });
  const description = commit.commit;

  return {
    author: {
      email: description.author.email,
      name: description.author.name,
      date: new Date(description.author.timestamp * 1000).toISOString(),
    },
    committer: {
      email: description.committer.email,
      name: description.committer.name,
      date: new Date(description.committer.timestamp * 1000).toISOString(),
    },
    message: description.message,
    parents: description.parent.map(parentSha => ({
      sha: parentSha,
    })),
    sha,
    tree: { sha: description.tree },
  };
}

export function create(
  config: Provider,
) {
  const router = Router();

  router.post('/storage/:documentId/git/commits', (request, response) => {
    const commitP = createCommit(config, request.body);

    handleResponse(commitP, response, false, 201);
  });

  router.get('/storage/:documentId/git/commits/:sha', (request, response) => {
    const commitP = getCommit(config, request.params.sha);

    handleResponse(commitP, response);
  });

  return router;
}
