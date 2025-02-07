import type { IBlob, ICreateBlobParams, ICreateBlobResponse } from '@osucad/multiplayer';
import type { Provider } from 'nconf';
import fs from 'node:fs';
import git from 'isomorphic-git';

export class GitService {
  constructor(
    config: Provider,
  ) {
    this.gitDir = config.get('storage');
  }

  private readonly gitDir: string;

  async getBlob(sha: string): Promise<IBlob> {
    const gitObj = await git.readBlob({
      fs,
      dir: this.gitDir,
      oid: sha,
    });

    return {
      sha,
      size: gitObj.blob.length,
      content: Buffer.from(gitObj.blob).toString('base64'),
      encoding: 'base64',
    };
  }

  async getBlobRaw(sha: string): Promise<Uint8Array> {
    const gitObj = await git.readBlob({
      fs,
      dir: this.gitDir,
      oid: sha,
    });

    return gitObj.blob;
  }

  async createBlob(params: ICreateBlobParams): Promise<ICreateBlobResponse> {
    const buffer = Buffer.from(params.content, params.encoding);

    const sha = await git.writeBlob({
      fs,
      dir: this.gitDir,
      blob: buffer,
    });

    return {
      sha,
    };
  }
}
