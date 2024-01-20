type ActionListener<T extends any[]> = (...args: T) => void;

export class Action<T extends any[]> {
  private _listeners: ActionListener<T>[] = [];

  addListener(listener: ActionListener<T>) {
    this._listeners.push(listener);
  }

  removeListener(listener: ActionListener<T>) {
    const index = this._listeners.indexOf(listener);
    if (index >= 0) {
      this._listeners.splice(index, 1);
    }
  }

  emit(...args: T) {
    for (const listener of this._listeners) {
      listener(...args);
    }
  }

  removeListeners() {
    this._listeners = [];
  }
}