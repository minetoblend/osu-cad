import IterableWeakSet from "../utils/IterableWeakSet";
import { Action } from "./Action";

export type BindableListener<T> = (value: T) => void;

export class Bindable<T> implements ReadonlyBindable<T>
{
  public valueChanged = new Action<ValueChangedEvent<T>>();

  public disabledChanged = new Action<boolean>();

  public defaultChanged = new Action<ValueChangedEvent<T>>();

  #value: T;

  #defaultValue: T;

  #disabled: boolean = false;

  public constructor(defaultValue: T)
  {
    this.#value = this.#defaultValue = defaultValue;
  }

  public get disabled()
  {
    return this.#disabled;
  }

  public set disabled(value)
  {
    if (this.#disabled === value)
      return;

    this.setDisabled(value);
  }

  protected setDisabled(value: boolean, bypassChecks = false, source?: Bindable<T>)
  {
    this.#disabled = value;
    this.triggerDisabledChange(source ?? this, true, bypassChecks);
  }

  public get isDefault()
  {
    return this.equals(this.#value, this.#defaultValue);
  }

  public setDefault()
  {
    this.value = this.default;
  }

  public get value(): T
  {
    return this.#value;
  }

  public set value(value: T)
  {
    if (this.disabled)
      throw new Error("Cannot set value on a disabled bindable");

    if (this.equals(this.#value, value))
      return;

    this.setValue(this.#value, value);
  }

  public setValue(previousValue: T, value: T, bypassChecks = false, source?: Bindable<T>)
  {
    this.#value = value;
    this.triggerValueChange(previousValue, source ?? this, true, bypassChecks);
  }

  public get default()
  {
    return this.#defaultValue;
  }

  public set default(value: T)
  {
    if (this.equals(this.#defaultValue, value))
      return;

    this.setDefaultValue(this.#defaultValue, value);
  }

  protected setDefaultValue(previousValue: T, value: T, bypassChecks = false, source?: Bindable<T>)
  {
    this.#defaultValue = value;
    this.triggerDefaultChange(previousValue, source ?? this, true, bypassChecks);
  }

  public bindValueChanged(listener: BindableListener<ValueChangedEvent<T>>, runOnceImmediately?: boolean): void;
  public bindValueChanged(listener: BindableListener<ValueChangedEvent<T>>, receiver: any, runOnceImmediately?: boolean): void;
  public bindValueChanged(listener: BindableListener<ValueChangedEvent<T>>, receiver?: any, runOnceImmediately?: boolean)
  {
    if (typeof receiver === "boolean" && runOnceImmediately === undefined)
    {
      runOnceImmediately = receiver;
      receiver = undefined;
    }

    this.valueChanged.addListener(listener, receiver);
    if (runOnceImmediately)
      listener.call(receiver, { value: this.value, previousValue: this.value });
  }

  public addOnChangeListener(listener: BindableListener<ValueChangedEvent<T>>, options: AddOnChangeListenerOptions = {})
  {
    this.valueChanged.addListener(listener, options.scoped);

    if (options.immediate)
    {
      listener({ value: this.value, previousValue: this.value });
    }
  }

  public removeOnChangeListener(listener: BindableListener<ValueChangedEvent<T>>): boolean
  {
    return this.valueChanged.removeListener(listener);
  }

  public removeAllListeners()
  {
    this.valueChanged.removeAllListeners();
  }

  public triggerValueChange(previousValue: T, source: Bindable<T>, propagateToBindings = true, bypassChecks = false)
  {
    const beforePropagation = this.#value;

    if (propagateToBindings && this.bindings)
    {
      for (const bindable of this.bindings)
      {
        if (bindable === source)
          continue;

        bindable.setValue(previousValue, this.#value, bypassChecks, this);
      }
    }

    if (this.equals(beforePropagation, this.#value))
    {
      this.valueChanged.emit({
        value: this.#value,
        previousValue,
      });
    }
  }

  public triggerDefaultChange(previousValue: T, source: Bindable<T>, propagateToBindings = true, bypassChecks = false)
  {
    const beforePropagation = this.#defaultValue;

    if (propagateToBindings && this.bindings)
    {
      for (const bindable of this.bindings)
      {
        if (bindable === source)
          continue;

        bindable.setDefaultValue(previousValue, this.#defaultValue, bypassChecks, this);
      }
    }

    if (this.equals(beforePropagation, this.#defaultValue))
    {
      this.defaultChanged.emit({
        value: this.#defaultValue,
        previousValue,
      });
    }
  }

  public triggerDisabledChange(source: Bindable<T>, propagateToBindings = true, bypassChecks = false)
  {
    const beforePropagation = this.#disabled;

    if (propagateToBindings && this.bindings)
    {
      for (const bindable of this.bindings)
      {
        if (bindable === source)
          continue;

        bindable.setDisabled(this.#disabled, bypassChecks, this);
      }
    }

    if (beforePropagation === this.#disabled)
      this.disabledChanged.emit(this.#disabled);
  }

  public unbindEvents()
  {
    this.valueChanged.removeAllListeners();
    this.disabledChanged.removeAllListeners();
    this.defaultChanged.removeAllListeners();
  }

  public unbindBindings()
  {
    if (!this.bindings)
      return;

    for (const bindable of this.bindings)
    {
      this.unbindFrom(bindable);
    }
  }

  public unbindAll()
  {
    this.unbindAllInternal();
  }

  protected unbindAllInternal()
  {
    // TODO: isLeased

    this.unbindEvents();
    this.unbindBindings();
  }

  public unbindFrom(bindable: Bindable<T>)
  {
    if (!this.bindings)
      return false;

    if (!this.#removeWeakReference(bindable))
      return false;

    bindable.#removeWeakReference(this);
    return true;
  }

  protected bindings?: IterableWeakSet<Bindable<T>>;

  public bindTo(bindable: Bindable<T>)
  {
    bindable.copyTo(this);

    this.#addWeakReference(bindable);
    bindable.#addWeakReference(this);
  }

  public copyTo(bindable: Bindable<T>)
  {
    bindable.value = this.value;
    bindable.default = this.default;
    bindable.setDisabled(this.disabled, true);
  }

  #addWeakReference(weakReference: Bindable<T>)
  {
    this.bindings ??= new IterableWeakSet();
    this.bindings.add(weakReference);
  }

  #removeWeakReference(bindable: Bindable<T>)
  {
    return this.bindings?.delete(bindable) ?? false;
  }

  protected equals(a: T, b: T): boolean
  {
    return a === b;
  }

  public triggerChange()
  {
    this.triggerValueChange(this.#value, this, false);
    this.triggerDisabledChange(this, false);
  }

  #weakReferenceInstance?: WeakRef<this>;

  /** @internal */
  public get weakReference()
  {
    return (this.#weakReferenceInstance ??= new WeakRef(this));
  }

  public getBoundCopy(): Bindable<T>
  {
    const copy = this.createInstance();

    copy.bindTo(this);

    return copy;
  }

  /** @internal */
  public createInstance(): Bindable<T>
  {
    return new Bindable(this.default);
  }
}

export interface AddOnChangeListenerOptions
{
  scoped?: boolean;
  immediate?: boolean;
}

export interface ValueChangedEvent<T>
{
  readonly value: T;
  readonly previousValue: T;
}

export interface ReadonlyBindable<T>
{
  get value(): T;

  get disabled(): boolean;

  get default(): T;

  get isDefault(): boolean;

  readonly valueChanged: Action<ValueChangedEvent<T>>;

  readonly disabledChanged: Action<boolean>;

  readonly defaultChanged: Action<ValueChangedEvent<T>>;

  addOnChangeListener: (listener: BindableListener<ValueChangedEvent<T>>, options?: AddOnChangeListenerOptions) => void;

  removeOnChangeListener: (listener: BindableListener<ValueChangedEvent<T>>) => boolean;

  getBoundCopy: () => ReadonlyBindable<T>;

  bindValueChanged(listener: BindableListener<ValueChangedEvent<T>>, receiver?: any, runOnceImmediately?: boolean): void;
}
