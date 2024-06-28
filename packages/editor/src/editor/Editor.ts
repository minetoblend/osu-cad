import {
  AudioManager,
  Axes,
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
  }
}
