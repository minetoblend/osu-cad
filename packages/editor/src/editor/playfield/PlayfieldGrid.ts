import type {
  ContainerOptions,
  KeyDownEvent,
  PIXIContainer,
} from 'osucad-framework';
import {
  BindableNumber,
  Container,
  definitelyBigger,
  dependencyLoader,
  Invalidation,
  PIXIGraphics,
  resolved,
} from 'osucad-framework';
import { Beatmap } from '../../beatmap/Beatmap';

export interface PlayfieldGridOptions extends ContainerOptions {
  customGridSize?: number;
}

export class PlayfieldGrid extends Container {
  constructor(options: PlayfieldGridOptions = {}) {
    super({
      width: 512,
      height: 384,
    });

    this.with(options);
  }

  #customGridSize?: number;

  get customGridSize() {
    return this.#customGridSize;
  }

  set customGridSize(value: number | undefined) {
    if (value === this.#customGridSize)
      return;

    this.#customGridSize = value;
    this.invalidate(Invalidation.Transform);
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

    this.gridSizeBindable.bindTo(this.beatmap.settings.editor.gridSizeBindable);
    this.gridSizeBindable.addOnChangeListener(() => this.drawGrid(), { immediate: true });

    this.beatmap.settings.editor.gridSizeBindable.addOnChangeListener(e => console.log(e));
  }

  gridSizeBindable = new BindableNumber(16);

  get gridSize() {
    return this.customGridSize ?? this.gridSizeBindable.value;
  }

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

    const size = this.gridSize;

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
        this.gridSizeBindable.value = this.#gridSizePresets[index];
        return true;
      }
    }

    return false;
  }
}
