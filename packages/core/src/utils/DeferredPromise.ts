export interface DeferredPromise<T> extends Promise<T>
{
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export function deferredPromise<T>(): DeferredPromise<T>
{
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason?: any) => void;

  const promise = new Promise<T>((resolveFn, rejectFn) =>
  {
    resolve = resolveFn;
    reject = rejectFn;
  });

  return Object.assign(promise, {
    resolve: resolve!,
    reject: reject!,
  });
}
