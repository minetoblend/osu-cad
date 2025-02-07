import type { Provider } from 'nconf';
import fs from 'node:fs';
import { Router } from 'express';
import git from 'isomorphic-git';
import { getGitDir, handleResponse } from './utils';

async function getTree(
  config: Provider,
  sha: string,
  recursive: boolean,
) {
  if (recursive) {
    const entries = await git.walk({
      fs,
      dir: getGitDir(config),
      trees: [git.TREE({ ref: sha } as any)],
      map: async (path, [head]) => {
        if (path === '.') {
          return;
        }

        return {
          path,
          mode: (await head!.mode()).toString(8),
          sha: await head!.oid(),
          size: 0,
          type: await head!.type(),
        };
      },
    });

    return {
      sha,
      tree: entries,
    };
  }

  const treeObj = await git.readTree({
    fs,
    dir: getGitDir(config),
    oid: sha,
  });
  const tree = treeObj.tree;

  return {
    sha,
    tree: tree.map((entry) => {
      return {
        path: entry.path,
        mode: entry.mode,
        sha: entry.oid,
        size: 0,
        type: entry.type,
      };
    }),
  };
}

export interface ICreateTreeEntry {
  path: string;
  mode: string;
  type: string;
  sha: string;
}

async function createTree(
  config: Provider,
  tree: { tree: ICreateTreeEntry[] },
) {
  const sha = await git.writeTree({
    fs,
    dir: getGitDir(config),
    tree: tree.tree.map((entry) => {
      return {
        type: entry.type as any,
        path: entry.path,
        mode: entry.mode,
        oid: entry.sha,
      };
    }),
  });

  return getTree(config, sha, false);
}

export function create(
  config: Provider,
) {
  const router = Router();

  router.post('/storage/:documentId/git/trees', (request, response) => {
    const treeP = createTree(
      config,
      request.body,
    );

    handleResponse(treeP, response);
  });

  router.get('/storage/:documentId/git/trees/:sha', (request, response) => {
    const treeP = getTree(
      config,
      request.params.sha,
      request.query.recursive === '1',
    );

    handleResponse(treeP, response, true);
  });

  return router;
}
