interface LoadQueueItem {
  load: () => void;
  shouldLoad?: () => boolean;
}

export class CarouselLoadQueue {
  readonly #queue = [] as LoadQueueItem[];

  loadNext() {
    let next = this.#queue.shift();

    while (next) {
      if (next.shouldLoad?.() !== false) {
        next.load();
        return;
      }

      next = this.#queue.shift();
    }
  }

  add(item: LoadQueueItem) {
    this.#queue.push(item);
  }
}
