import { Component, Ref } from 'vue';
import { Vec2 } from '@osucad/common';
import Vec2ParameterControl from '../../components/operator/Vec2ParameterControl.vue';

export interface ParameterOptions<T> {
  value: T;
  label: string;
  component?: Component;
}

export class Parameter<T> {
  constructor(options: ParameterOptions<T>) {
    const { value, label, component } = options;
    this._value = shallowRef<T>(value);
    this.label = label;
    this.component = component;
  }

  private _value: Ref<T>;
  readonly label: string;
  readonly component?: Component;

  get value() {
    return this._value.value;
  }

  set value(value: T) {
    this._value.value = value;
  }
}

export class Vec2Parameter extends Parameter<Vec2> {
  constructor(options: ParameterOptions<Vec2>) {
    super({
      component: Vec2ParameterControl,
      ...options,
    });
  }
}
