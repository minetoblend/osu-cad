export function RefProperty(shallow: boolean = false): PropertyDecorator {
  return function (target: any, key: string | symbol) {
    const property = Symbol(key.toString());
    Object.defineProperty(target, key, {
      get() {
        if (this[property] === undefined) {
          this[property] = shallow ? shallowRef() : ref();
        }
        return this[property];
      },
      set(value) {
        this[property] = value;
      },
    });
  };
}
