import type { ResolvedAsset, TextureSourceOptions } from "pixi.js";

import ImageBitmapWorker from "./ImageBitmapWorker?worker&inline";

let UUID = 0;
let MAX_WORKERS: number;

interface LoadImageBitmapResult 
{
  data?: ImageBitmap;
  error?: Error;
  uuid: number;
  id: string;
}

export interface LoadImageBitmapOptions 
{
  resize?: {
    width: number;
    height: number;
    mode: "fit" | "fill" | "stretch" | "max";
  };
}

class WorkerManagerClass 
{
  public worker!: Worker;
  readonly #resolveHash: {
    [key: string]: {
      resolve: (...param: any[]) => void;
      reject: (...param: any[]) => void;
    };
  };

  readonly #workerPool: Worker[];
  readonly #queue: {
    id: string;
    arguments: any[];
    resolve: (...param: any[]) => void;
    reject: (...param: any[]) => void;
  }[];

  #initialized = false;
  #createdWorkers = 0;

  constructor() 
  {
    this.#workerPool = [];
    this.#queue = [];

    this.#resolveHash = {};
  }

  public loadImageBitmap(src: string | ArrayBuffer, asset?: ResolvedAsset<TextureSourceOptions>, options?: LoadImageBitmapOptions): Promise<ImageBitmap> 
  {
    return this.#run("loadImageBitmap", [src, asset?.data?.alphaMode, options]) as Promise<ImageBitmap>;
  }

  async #initWorkers() 
  {
    if (this.#initialized)
      return;

    this.#initialized = true;
  }

  #getWorker(): Worker 
  {
    if (MAX_WORKERS === undefined) 
    {
      MAX_WORKERS = Math.min(navigator.hardwareConcurrency || 2, 2);
    }
    let worker = this.#workerPool.pop();

    if (!worker && this.#createdWorkers < MAX_WORKERS) 
    {
      // only create as many as MAX_WORKERS allows..
      this.#createdWorkers++;
      worker = new ImageBitmapWorker();

      const canvas = document.createElement("canvas");

      const offscreenCanvas = canvas.transferControlToOffscreen();

      worker.postMessage({
        data: ["canvas", offscreenCanvas],
        uuid: 0,
        id: "init",
      }, [offscreenCanvas]);

      worker.addEventListener("message", (event: MessageEvent) => 
      {
        this.#complete(event.data);

        this.#returnWorker(event.target as Worker);
        this.#next();
      });
    }

    return worker!;
  }

  #returnWorker(worker: Worker) 
  {
    this.#workerPool.push(worker);
  }

  #complete(data: LoadImageBitmapResult): void 
  {
    if (data.error !== undefined) 
    {
      this.#resolveHash[data.uuid].reject(data.error);
    }
    else 
    {
      this.#resolveHash[data.uuid].resolve(data.data);
    }

    delete this.#resolveHash[data.uuid];
  }

  async #run(id: string, args: any[]): Promise<any> 
  {
    await this.#initWorkers();
    // push into the queue...

    const promise = new Promise((resolve, reject) => 
    {
      this.#queue.push({ id, arguments: args, resolve, reject });
    });

    this.#next();

    return promise;
  }

  #next(): void 
  {
    // nothing to do
    if (!this.#queue.length)
      return;

    const worker = this.#getWorker();

    // no workers available...
    if (!worker) 
    {
      return;
    }

    const toDo = this.#queue.pop()!;

    const id = toDo.id;

    this.#resolveHash[UUID] = { resolve: toDo.resolve, reject: toDo.reject };

    worker.postMessage({
      data: toDo.arguments,
      uuid: UUID++,
      id,
    });
  }
}

const WorkerManager = new WorkerManagerClass();

export {
  WorkerManager,
};
