import { getCurrentDrawablScope } from "./lifetimeScope";

export type ListenerArgs<T> = T extends [...infer U] ? U : [T];

export type ListenerFn<T> = (...args: ListenerArgs<T>) => void;

class Listener<T>
{
  constructor(
    readonly fn: ListenerFn<T>,
    readonly receiver?: any,
    readonly once: boolean = false,
  )
  {}
}

export class Action<T = void>
{
  #listeners: Listener<T>[] = [];

  addListener(fn: ListenerFn<T>, receiver?: any, scoped: boolean = true)
  {
    this.#listeners.push(new Listener(fn, receiver));
    if (scoped)
    {
      const scope = getCurrentDrawablScope();
      if (scope)
      {
        scope.onDispose(() => this.removeListener(fn, receiver));
      }
    }
  }

  removeListener(fn: ListenerFn<T>, receiver?: any): boolean
  {
    for (let i = 0; i < this.#listeners.length; i++)
    {
      if (this.#listeners[i].fn === fn)
      {
        if (receiver && this.#listeners[i].receiver !== receiver)
          continue;

        this.#listeners.splice(i, 1);
        return true;
      }
    }

    return false;
  }

  removeAllListeners()
  {
    this.#listeners.length = 0;
  }

  once(listener: ListenerFn<T>, receiver?: any)
  {
    this.#listeners.push(new Listener(listener, receiver, true));
  }

  emit(...args: ListenerArgs<T>)
  {
    for (let i = 0; i < this.#listeners.length; i++)
    {
      const listener = this.#listeners[i];
      if (listener.receiver)
      {
        listener.fn.call(listener.receiver, ...args);
      }
      else
      {
        listener.fn(...args);
      }

      if (listener.once)
      {
        this.#listeners.splice(i--, 1);
      }
    }
  }
}
