import {
  AlphaFilter,
  Bindable,
  Container,
  ContainerOptions,
  KeyDownEvent,
  PIXIContainer,
  PIXIGraphics,
  dependencyLoader,
} from 'osucad-framework';

export class PlayfieldGrid extends Container {
  constructor(options: ContainerOptions = {}) {
    super({
      width: 512,
      height: 384,
      ...options,
    });
  }

  createDrawNode(): PIXIContainer {
    return new PIXIGraphics({
      filters: new AlphaFilter({
        alpha: 0.5,
        resolution: devicePixelRatio,
      }),
    });
  }

  #pixelSize = 1;

  @dependencyLoader()
  init() {
    this.gridSize.addOnChangeListener(
      () => {
        this.drawGrid();
      },
      { immediate: true },
    );
  }

  gridSize = new Bindable(16);

  updateSubTreeTransforms(): boolean {
    if (!super.updateSubTreeTransforms()) return false;

    const x1 = this.drawNode.toGlobal({ x: 0, y: 0 }).x;
    const x2 = this.drawNode.toGlobal({ x: 1, y: 0 }).x;

    const pixelSize = x2 - x1;

    if (pixelSize === this.#pixelSize) return true;

    this.#pixelSize = x2 - x1;
    this.drawGrid();

    return true;
  }

  drawGrid() {
    const g = this.drawNode as PIXIGraphics;

    g.clear();

    g.rect(0, 0, 512, 384).stroke({
      color: 0xffffff,
      alpha: 0.5,
      width: 2 / this.#pixelSize,
    });

    const size = this.gridSize.value;

    g.beginPath();
    for (let i = size; i <= 512 - size; i += size) {
      g.moveTo(i, 0).lineTo(i, 384);
    }

    for (let i = size; i <= 384 - size; i += size) {
      g.moveTo(0, i).lineTo(512, i);
    }

    g.stroke({
      color: 0xffffff,
      alpha: 0.25,
      width: 1 / this.#pixelSize,
    });
  }

  #gridSizePresets = [4, 8, 16, 32, 64];

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key.startsWith('Digit') && e.controlPressed) {
      const index = parseInt(e.key[5]) - 1;
      if (index >= 0 && index < this.#gridSizePresets.length) {
        this.gridSize.value = this.#gridSizePresets[index];
        return true;
      }
    }

    return false;
  }
}
