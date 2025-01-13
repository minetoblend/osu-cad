import type { ContainerOptions } from 'osucad-framework';
import { Axes, Container } from 'osucad-framework';

export class SafeAreaContainer extends Container {
  constructor(options: ContainerOptions) {
    super({
      relativeSizeAxes: Axes.Both,
      ...options,
    });

    const left = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sal').replace('px', ''));
    const top = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sat').replace('px', ''));
    const right = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sar').replace('px', ''));
    const bottom = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sab').replace('px', ''));
    if (Number.isFinite(left) && Number.isFinite(top) && Number.isFinite(right) && Number.isFinite(bottom)) {
      this.padding = { left, top, right, bottom };
    }
  }
}
