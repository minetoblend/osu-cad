import Deque from "double-ended-queue";
import { EventEmitter } from "eventemitter3";
import { assert } from "@osucad/multiplayer-core";

export interface IDeltaQueueEvents<T>
{
  op(task: T): void

  push(task: T): void

  error(error: any): void
}

export interface IDeltaQueue<T>
{
  paused: boolean;
  length: number;
  idle: boolean;

  pause(): Promise<void>;

  resume(): void;

  peek(): T | undefined;

  toArray(): T[]

  waitTillProcessingDone(): Promise<{ count: number; duration: number }>;
}


export interface IDeltaQueueWriter<T>
{
  push(task: T): void

  clear(): void
}

export class DeltaQueue<T> extends EventEmitter<IDeltaQueueEvents<T>> implements IDeltaQueue<T>, IDeltaQueueWriter<T>
{
  #disposed = false;
  #q = new Deque<T>();

  #pauseCount = 1;
  #processingPromise: Promise<{ count: number; duration: number }> | undefined;
  readonly #worker: (task: T) => void;

  constructor(worker: (task: T) => void)
  {
    super();
    this.#worker = worker;
  }

  get paused()
  {
    return this.#pauseCount > 0;
  }

  get length()
  {
    return this.#q.length;
  }

  get idle()
  {
    return this.#processingPromise === undefined && this.#q.length === 0;
  }

  async waitTillProcessingDone(): Promise<{ count: number; duration: number }>
  {
    return this.#processingPromise ?? { count: 0, duration: 0 };
  }

  clear()
  {
    this.#q.clear();
  }

  peek(): T | undefined
  {
    return this.#q.peekFront();
  }

  toArray(): T[]
  {
    return this.#q.toArray();
  }

  push(task: T)
  {
    try
    {
      this.#q.push(task);
      this.emit("push", task);
      this.#ensureProcessing();
    }
    catch (err)
    {
      this.emit("error", err);
    }
  }

  async pause()
  {
    this.#pauseCount++;
    await this.waitTillProcessingDone();
  }

  resume()
  {
    assert(
        this.#pauseCount > 0,
        "Non-zero pause count on resume",
    );
    this.#pauseCount--;
    this.#ensureProcessing();
  }

  #anythingToProcess()
  {
    return this.#q.length > 0 && !this.paused;
  }

  #ensureProcessing()
  {
    if (this.#anythingToProcess() && this.#processingPromise === undefined)
    {
      this.#processingPromise = Promise.resolve()
        .then(() => this.#processDeltas())
        .catch(() => ({ count: 0, duration: 0 }))
        .finally(() => this.#processingPromise = undefined);
    }
  }

  #processDeltas(): { count: number, duration: number }
  {
    const start = performance.now();
    let count = 0;

    while (this.#anythingToProcess())
    {
      const next = this.#q.shift();
      count++;
      this.#worker(next!);
      this.emit("op", next!);
    }

    const duration = performance.now() - start;

    return { count, duration };
  }
}
