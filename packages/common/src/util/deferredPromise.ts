export class DeferredPromise {
  private _promise?: Promise<any>;

  private _deferred: Promise<any>[] = [];

  get promise(): Promise<void> {
    this._promise ??= Promise.all(this._deferred);
    return this._promise as Promise<void>;
  }

  add<T>(promise: Promise<T> | (() => Promise<T>)): void {
    if (this._promise) {
      throw new Error('Cannot add promise to resolved DeferredPromise');
    }
    if (typeof promise === 'function') {
      promise = promise();
    }
    this._deferred.push(promise);
  }
}
