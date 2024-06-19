import { dependencyLoader } from '../framework/di/DependencyLoader';
import { Axes } from '../framework/drawable/Axes';
import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from '../framework/drawable/ContainerDrawable';
import { DrawsizePreservingContainer } from '../framework/drawable/DrawsizePreservingContainer';
import { BeatmapBackground } from './BeatmapBackground';
import { EditorGrid } from './EditorGrid';
import { HitObjectContainer } from '@/editor/playfield/HitObjectContainer.ts';
import { Menu } from './components/Menu';
import { MenuItem } from './components/MenuItem';
import { Anchor } from '@/framework/drawable/Anchor';
import { VolumeKnob } from './bottomBar/VolumeKnob';
import { VolumeSelector } from './bottomBar/VolumeSelector';

export class PlayfieldContainer extends ContainerDrawable {
  constructor(options: ContainerDrawableOptions = {}) {
    super(options);
    this.relativeSizeAxes = Axes.Both;
    this.drawNode.enableRenderGroup();
  }

  private playfieldContent = new DrawsizePreservingContainer({
    width: 512,
    height: 384,
  });

  override get content() {
    return this.playfieldContent;
  }

  override get children() {
    return this.playfieldContent.children;
  }

  @dependencyLoader()
  load() {
    this.addInternal(this.playfieldContent);
    this.playfieldContent.relativeSizeAxes = Axes.Both;
    this.add(new BeatmapBackground());
    this.add(new EditorGrid());
    this.add(new HitObjectContainer());
  }
}
