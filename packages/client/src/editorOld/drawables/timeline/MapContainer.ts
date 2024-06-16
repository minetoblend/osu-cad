import { Container } from 'pixi.js';

export interface MappedContainerOptions<T> {
  createContainer: (key: T) => Container;
}

export interface ICanPreventDiscard {
  canDiscard?: boolean;
}

export class MapContainer<T> extends Container {
  private readonly containerMap = new Map<T, Container>();

  constructor(options: MappedContainerOptions<T>) {
    super();
    this.createContainer = options.createContainer;
  }

  public createContainer: (key: T) => Container;

  updateChildren(items: T[]) {
    const shouldRemove = new Set(this.containerMap.keys());

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      shouldRemove.delete(item);

      let container = this.containerMap.get(item);
      if (!container) {
        container = this.createContainer(item);
        this.containerMap.set(item, container);
        this.addChild(container);
      }
      container.zIndex = i;
    }
    this.sortChildren();

    for (const item of shouldRemove) {
      const container = this.containerMap.get(item);
      if (container) {
        if ((container as ICanPreventDiscard).canDiscard === false) {
          continue;
        }
        container.destroy();
      }
      this.containerMap.delete(item);
    }
  }
}
