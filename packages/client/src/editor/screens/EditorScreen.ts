import gsap from 'gsap';
import { Axes } from '../../framework/drawable/Axes';
import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from '../../framework/drawable/ContainerDrawable';

export class EditorScreen extends ContainerDrawable {
  constructor(options: ContainerDrawableOptions = {}) {
    super({
      relativeSizeAxes: Axes.Both,
      ...options,
    });
  }

  isHiding = false;

  receivePositionalInputAt(): boolean {
    return !this.isHiding;
  }

  hide(done: () => void) {
    gsap.to(this, {
      alpha: 0,
      duration: 0.2,
      onComplete: () => {
        done();
      },
    });
  }

  show() {
    this.alpha = 0;
    gsap.to(this, {
      alpha: 1,
      duration: 0.2,
    });
  }
}
