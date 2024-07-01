import {
  Anchor,
  Axes,
  Container,
  DrawSizePreservingFillContainer,
  dependencyLoader,
} from 'osucad-framework';
import { PlayfieldGrid } from './PlayfieldGrid';
import { BeatmapBackground } from './BeatmapBackground';
import { HitObjectContainer } from '../hitobjects/HitObjectContainer';

export class PlayfieldContainer extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });

    let container: DrawSizePreservingFillContainer;
    this.addInternal(
      (container = new DrawSizePreservingFillContainer({
        targetDrawSize: { x: 512, y: 384 },
      })),
    );

    container.add(
      (this.#content = new Container({
        width: 512,
        height: 384,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      })),
    );
  }

  #content: Container;

  get content() {
    return this.#content;
  }

  @dependencyLoader()
  init() {
    this.addAll(
      new BeatmapBackground(),
      new PlayfieldGrid(),
      new HitObjectContainer(),
    );
  }
}
