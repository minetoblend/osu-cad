import { Axes } from './drawable/Axes';
import { ContainerDrawable } from './drawable/ContainerDrawable';
import { Drawable } from './drawable/Drawable';

export abstract class SuspenseContainer extends ContainerDrawable {
  constructor() {
    super();
    this.isSuspenseBarrier = true;
    this.addInternal(this.innerContainer);
    this.addInternal(this.fallbackContainer);
    this.innerContainer.relativeSizeAxes = Axes.Both;
    this.fallbackContainer.relativeSizeAxes = Axes.Both;
  }

  innerContainer = new ContainerDrawable();

  awaitedDrawables: Drawable[] = [];

  fallbackContainer = new ContainerDrawable();

  fallback?: Drawable;

  get content() {
    return this.innerContainer;
  }

  abstract createFallback(): Drawable;

  waitForDrawable(drawable: Drawable, promise: Promise<void>) {
    this.awaitedDrawables.push(drawable);
    this.updateState();
    promise.then(() => {
      const index = this.awaitedDrawables.indexOf(drawable);
      if (index === -1) {
        throw new Error('Drawable was not awaited');
      }
      this.awaitedDrawables.splice(index, 1);
      this.updateState();
    });
  }

  updateState() {
    if (this.awaitedDrawables.length === 0) {
      this.innerContainer.isPresent = true;
      if (this.fallback) {
        this.fallbackContainer.removeInternal(this.fallback);
        this.fallback = undefined;
      }
      this.onLoad.trigger();
    } else {
      this.innerContainer.isPresent = false;
      this.fallback ??= this.fallbackContainer.add(this.createFallback());
    }
  }

  #onLoad = createEventHook<void>();
  get onLoad() {
    return this.#onLoad;
  }
}
