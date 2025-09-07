import git from "isomorphic-git";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { cwd } from "node:process";
import * as fs from "node:fs";

export class BlobStorage
{
  private constructor(private dataDir: string)
  {
  }

  public static async create()
  {
    const dataDir = resolve(cwd(), ".data");

    await mkdir(dataDir, { recursive: true });

    return new BlobStorage(dataDir);
  }

  public async readBlob(sha: string): Promise<Uint8Array | null>
  {
    try
    {
      const { blob } = await git.readBlob({
        fs,
        gitdir: this.dataDir,
        oid: sha,
      });

      return blob;
    }
    catch
    {
      return null;
    }
  }

  public async writeBlob(data: Uint8Array): Promise<string>
  {
    const sha = await git.writeBlob({
      fs,
      gitdir: this.dataDir,
      blob: data,
    });

    return sha;
  }
}
