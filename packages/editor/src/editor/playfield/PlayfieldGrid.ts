import {
  ContainerOptions,
  definitelyBigger,
  KeyDownEvent,
  PIXIContainer,
} from 'osucad-framework';
import {
  BindableNumber,
  Container,
  dependencyLoader,
  PIXIGraphics,
  resolved,
} from 'osucad-framework';
import { Beatmap } from '../../beatmap/Beatmap';

export class PlayfieldGrid extends Container {
  constructor(options: ContainerOptions = {}) {
    super({
      width: 512,
      height: 384,
      ...options,
    });
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  createDrawNode(): PIXIContainer {
    return new PIXIGraphics();
  }

  #pixelSize = 1;

  @dependencyLoader()
  init() {
    this.alpha = 0.5;

    this.gridSize.bindTo(this.beatmap.settings.editor.gridSizeBindable);
    this.gridSize.addOnChangeListener(() => this.drawGrid(), { immediate: true });

    this.beatmap.settings.editor.gridSizeBindable.addOnChangeListener(e => console.log(e));
  }

  gridSize = new BindableNumber(16);

  updateSubTreeTransforms(): boolean {
    if (!super.updateSubTreeTransforms())
      return false;

    const pixelSize = this.drawNode.worldTransform.a;

    if (pixelSize === this.#pixelSize)
      return true;

    this.#pixelSize = pixelSize;
    this.drawGrid();

    return true;
  }

  drawGrid() {
    const g = this.drawNode as PIXIGraphics;

    g.clear();

    g.rect(0, 0, 512, 384).stroke({
      color: 0xFFFFFF,
      alpha: 0.5,
      width: 2 / this.#pixelSize,
    });

    const size = this.gridSize.value;

    if (definitelyBigger(size, 0)) {

      g.beginPath();
      for (let i = size; i <= 512 - size; i += size) {
        g.moveTo(i, 0).lineTo(i, 384);
      }

      for (let i = size; i <= 384 - size; i += size) {
        g.moveTo(0, i).lineTo(512, i);
      }

      g.stroke({
        color: 0xFFFFFF,
        alpha: 0.25,
        width: 1 / this.#pixelSize,
      });
    }
  }

  #gridSizePresets = [4, 8, 16, 32, 64];

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key.startsWith('Digit') && e.controlPressed) {
      const index = Number.parseInt(e.key[5]) - 1;
      if (index >= 0 && index < this.#gridSizePresets.length) {
        this.gridSize.value = this.#gridSizePresets[index];
        return true;
      }
    }

    return false;
  }
}
