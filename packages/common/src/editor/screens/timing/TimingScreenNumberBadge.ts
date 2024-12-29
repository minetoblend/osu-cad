import type { Bindable } from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import { dependencyLoader } from 'osucad-framework';
import { TimingScreenInputBadge } from './TimingScreenInputBadge';

export interface TimingScreenNumberBadgeOptions {
  bindable: Bindable<number>;
  color: ColorSource;
  format: (value: number) => string;
  suffix?: string;
}

export class TimingScreenNumberBadge extends TimingScreenInputBadge {
  constructor(options: TimingScreenNumberBadgeOptions) {
    super(options.color);

    this.current = options.bindable.getBoundCopy();
    this.format = options.format;
    this.suffix = options.suffix;
  }

  readonly current: Bindable<number>;

  readonly format: (value: number) => string;

  @dependencyLoader()
  [Symbol('load')]() {
    this.current.addOnChangeListener((evt) => {
      this.textBox.text = this.format(evt.value);
    }, { immediate: true });
  }

  protected override onCommit(text: string) {
    const parsed = Number.parseFloat(text);
    if (Number.isFinite(parsed))
      this.current.value = parsed;
    else
      this.textBox.text = this.format(this.current.value);
  }
}
