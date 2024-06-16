import { dependencyLoader, resolved } from '../framework/di/DependencyLoader';
import { Axes } from '../framework/drawable/Axes';
import { ContainerDrawable } from '../framework/drawable/ContainerDrawable';
import { DrawsizePreservingContainer } from '../framework/drawable/DrawsizePreservingContainer';
import { Fit } from '../framework/drawable/Fit';
import { MarginPadding } from '../framework/drawable/MarginPadding';
import { EditorClock } from './EditorClock';
import { EditorBottomBar } from './bottomBar/EditorBottomBar';
import { ComposeScreen } from './screens/compose/ComposeScreen';
import { EditorTopBar } from './topBar/EditorTopBar';
import { Skin } from '@/editor/skins/skin.ts';
import { BitmapText } from 'pixi.js';
import { EditorInputManager } from '@/editor/EditorInputManager.ts';
import { UISamples } from '@/editor/UISamples.ts';
import { AudioManager } from '@/framework/audio/AudioManager.ts';

export class BeatmapEditor extends ContainerDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
    this.addInternal(this.content);
  }

  private innerContainer = new DrawsizePreservingContainer({
    width: 960,
    height: 768,
    fit: Fit.Fill,
  });

  override get content() {
    return this.innerContainer;
  }

  screenContainer = new ContainerDrawable({
    relativeSizeAxes: Axes.Both,
  });

  @resolved(AudioManager)
  audioManager!: AudioManager;

  @dependencyLoader()
  async load() {
    const clock = new EditorClock();
    this.dependencies.provide(clock);
    this.add(clock);
    const skin = new Skin();
    this.dependencies.provide(skin);

    const uiSamples = new UISamples(this.audioManager);
    this.dependencies.provide(uiSamples);

    // weird hack to get fonts loaded
    this.drawNode.addChild(
      new BitmapText({
        text: ' ',
        style: {
          fontFamily: 'Nunito Sans',
        },
      }),
    );

    await Promise.all([skin.load(), uiSamples.load()]);

    // await new Promise((resolve) => setTimeout(resolve, 1000));

    this.add(new EditorInputManager());

    this.screenContainer = this.add(
      new ContainerDrawable({
        relativeSizeAxes: Axes.Both,
        margin: new MarginPadding({
          top: 84,
          bottom: 48,
          horizontal: 0,
        }),
        children: [new ComposeScreen()],
      }),
    );
    this.add(new EditorTopBar());
    this.add(new EditorBottomBar());
  }
}
