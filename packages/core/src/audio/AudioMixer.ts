import {
  type AudioChannel,
  type AudioManager,
  Bindable,
  Component,
  type ReadonlyDependencyContainer,
  resolved,
} from '@osucad/framework';
import { OsucadConfigManager } from '../config/OsucadConfigManager';
import { OsucadSettings } from '../config/OsucadSettings';

export class AudioMixer extends Component {
  constructor(readonly audioManager: AudioManager) {
    super();
    this.music = audioManager.createChannel();
    this.hitsounds = audioManager.createChannel();
    this.userInterface = audioManager.createChannel();
  }

  readonly music: AudioChannel;

  readonly hitsounds: AudioChannel;

  readonly userInterface: AudioChannel;

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  masterVolume = new Bindable(100);

  musicVolume = new Bindable(100);

  hitsoundVolume = new Bindable(100);

  uiVolume = new Bindable(100);

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.masterVolume.addOnChangeListener(e => this.audioManager.masterVolume = (e.value / 100) ** 2);
    this.musicVolume.addOnChangeListener(e => this.music.volume = (e.value / 100) ** 2);
    this.hitsoundVolume.addOnChangeListener(e => this.hitsounds.volume = (e.value / 100) ** 2);
    this.uiVolume.addOnChangeListener(e => this.userInterface.volume = (e.value / 100) ** 2);

    this.config.bindWith(OsucadSettings.MasterVolume, this.masterVolume);
    this.config.bindWith(OsucadSettings.MusicVolume, this.musicVolume);
    this.config.bindWith(OsucadSettings.HitsoundVolume, this.hitsoundVolume);
    this.config.bindWith(OsucadSettings.UIVolume, this.uiVolume);
  }
}
