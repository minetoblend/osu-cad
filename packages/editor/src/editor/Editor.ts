import {
  AudioManager,
  Axes,
  Bindable,
  Container,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { EditorBottomBar } from './EditorBottomBar';
import { EditorClock } from './EditorClock';
import { EditorMixer } from './EditorMixer';
import { EditorScreenContainer } from './EditorScreenContainer';
import { EditorTopBar } from './EditorTopBar';
import { EditorContext } from './context/EditorContext';
import { EditorScreenType } from './screens/EditorScreenType';
import { ComposeScreen } from './screens/compose/ComposeScreen';
import { SetupScreen } from './screens/setup/SetupScreen';

export class Editor extends Container {
  constructor(readonly context: EditorContext) {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  #screenContainer!: EditorScreenContainer;

  #topBar!: EditorTopBar;

  #bottomBar!: EditorBottomBar;

  @resolved(AudioManager)
  audioManager!: AudioManager;

  #mixer!: EditorMixer;

  @dependencyLoader()
  init() {
    const mixer = new EditorMixer(this.audioManager);
    this.add(mixer);

    const track = this.audioManager.createTrack(mixer.music, this.context.song);

    const clock = new EditorClock(track);
    this.add(clock);

    this.dependencies.provide(mixer);
    this.dependencies.provide(clock);

    this.addAll(
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: 84, bottom: 48 },
        child: (this.#screenContainer = new EditorScreenContainer()),
      }),
      (this.#topBar = new EditorTopBar()),
      (this.#bottomBar = new EditorBottomBar()),
    );

    addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        if (track.isRunning) {
          track.stop();
        } else {
          track.start();
        }
      }
    });

    this.currentScren.addOnChangeListener(
      (screen) => {
        this.#updateScreen(screen);
      },
      { immediate: true },
    );
  }

  readonly currentScren = new Bindable(EditorScreenType.Compose);

  #updateScreen(screen: EditorScreenType) {
    switch (screen) {
      case EditorScreenType.Setup:
        this.#screenContainer.screen = new SetupScreen();
        break;
      case EditorScreenType.Compose:
        this.#screenContainer.screen = new ComposeScreen();
        break;
    }
  }
}
