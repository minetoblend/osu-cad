import type { ITransformable } from './ITransformable';
import type { Transform } from './Transform';

export class TransformSequence<T extends ITransformable> {
  readonly #transforms: Transform[] = [];

  readonly #origin: T;

  readonly #startTime: number;

  #currentTime: number;

  #lastEndTime: number;

  get #endTime() {
    return Math.max(this.#currentTime, this.#lastEndTime);
  }

  #last: Transform | null = null;

  get #hasEnd() {
    return this.#endTime !== Infinity;
  }

  constructor(origin: T) {
    this.#origin = origin;
    this.#startTime = this.#currentTime = this.#lastEndTime = origin.transformStartTime;
  }

  add(transform: Transform) {
    if (transform.targetTransformable !== this.#origin)
      throw new Error('Transform does not target the origin of this sequence');

    this.#transforms.push(transform);

    if (this.#last === null || transform.endTime > this.#last.endTime) {
      this.#last = transform;
      this.#lastEndTime = this.#last.endTime;
    }
  }

  append(generator: (o: T) => TransformSequence<T>) {
    let child: TransformSequence<T>;
    {
      using _ = this.#origin.beginAbsoluteSequence(this.#currentTime, false);
      child = generator(this.#origin);
    }

    if (child!.origin !== this.#origin)
      throw new Error('Child sequence does not target the same origin as the parent sequence');

    for (const t of child!.transforms) {
      this.add(t);
    }

    return this;
  }

  get origin() {
    return this.#origin;
  }

  get transforms(): ReadonlyArray<Transform> {
    return this.#transforms;
  }

  delay(duration: number): this {
    this.#currentTime += duration;

    return this;
  }

  then(delay = 0): this {
    if (!this.#hasEnd) {
      throw new Error('Can not perform then on an endless TransformSequence.');
    }

    this.#currentTime = this.#endTime;

    return this.delay(delay);
  }

  asProxy(): TransformSequenceProxy<T> {
    const isProxy = '__is_proxy__';
    if ((this as any)[isProxy]) {
      return this as any;
    }

    const proxy = new Proxy(this, {
      get(target: TransformSequence<T>, p: string | symbol, receiver: any): any {
        if (p === isProxy) {
          return true;
        }

        const ownValue = Reflect.get(target, p, target);
        if (ownValue !== undefined) {
          if (typeof ownValue === 'function') {
            return (...args: any[]) => {
              const result = ownValue.apply(target, args);

              return result === target ? proxy : result;
            };
          }

          return ownValue;
        }

        const originValue = Reflect.get(target.origin, p, receiver);
        if (originValue) {
          if (typeof originValue === 'function') {
            return (...args: any[]) => {
              target.append((o: any) => {
                const result = o[p](...args);
                return result && result instanceof TransformSequence ? result : new TransformSequence(o);
              });

              return proxy;
            };
          }
        }

        return originValue;
      },
    }) as any;

    return proxy;
  }
}

export type TransformSequenceProxy<T extends ITransformable> = TransformSequence<T> & T;
