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
import { isMobile } from '@/utils';
import { MenuContainer } from './components/MenuContainer';

export class BeatmapEditor extends ContainerDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
    this.addInternal(this.content);
  }

  get resolution() {
    if (isMobile()) {
      return {
        width: 640,
        height: 480,
      };
    }

    return {
      width: 960,
      height: 768,
    };
  }

  private innerContainer = new DrawsizePreservingContainer({
    width: this.resolution.width,
    height: this.resolution.height,
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
    const menuContainer = new MenuContainer();
    this.dependencies.provide(menuContainer);

    this.add(new EditorTopBar());
    this.add(new EditorBottomBar());
    this.add(new EditorInputManager());
    this.add(menuContainer);
  }
}
