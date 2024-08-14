import type { ContainerOptions, DropEvent, InputManager } from 'osucad-framework';
import { Action, Anchor, Axes, Container, LowpassFilter, RoundedBox, dependencyLoader, resolved } from 'osucad-framework';
import gsap from 'gsap';
import { ThemeColors } from '../editor/ThemeColors';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { EditorMixer } from '../editor/EditorMixer';
import { UISamples } from '../UISamples';
import { NotificationOverlay } from '../notifications/NotificationOverlay';
import { Notification } from '../notifications/Notification';
import { DialogContainer } from '../modals/DialogContainer';
import type { MapsetInfo } from './MapsetInfo';
import { BeatmapImportDialog } from './BeatmapImportDialog';

export interface BeatmapImportDropzoneOptions extends ContainerOptions {}

export class BeatmapImportDropzone extends Container {
  constructor(options: BeatmapImportDropzoneOptions = {}) {
    super();

    this.addInternal(this.#content = new Container({
      relativeSizeAxes: Axes.Both,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      masking: true,
    }));

    this.apply(options);
  }

  uploadFinished = new Action<MapsetInfo>();

  readonly #content: Container;

  get content() {
    return this.#content;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.addInternal(this.#overlay = new DropzoneOverlay());
  }

  #inputManager!: InputManager;

  #overlay!: DropzoneOverlay;

  protected loadComplete() {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
    if (!this.#inputManager) {
      throw new Error('BeatmapImportDropzone could not find an InputManager in its parent hierarchy');
    }
  }

  update() {
    super.update();

    const files = this.#inputManager.currentState.draggedFiles;

    const isDrag = files !== null;
    if (isDrag && !this.dragActive) {
      this.onDragEnter();
    }
    else if (!isDrag && this.dragActive) {
      this.onDragLeave();
    }

    this.dragActive = isDrag;
  }

  dragActive = false;

  onDragEnter() {
    gsap.to(this.content, {
      scaleX: 0.9,
      scaleY: 0.9,
      rotation: 0.05,
      alpha: 0.5,
      duration: 1.2,
      ease: 'expo.out',
    });

    this.#overlay.show();
  }

  onDragLeave() {
    gsap.to(this.content, {
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      alpha: 1,
      duration: 1.2,
      ease: 'expo.out',
    });

    this.#overlay.hide();
  }

  @resolved(NotificationOverlay)
  notifications!: NotificationOverlay;

  receivePositionalInputAt(): boolean {
    return true;
  }

  onDrop(e: DropEvent): boolean {
    const files = e.files;

    if (files == null) {
      return false;
    }

    if (files.length === 1) {
      const file = files[0];

      const extension = file.name.split('.').pop();

      switch (extension) {
        case 'osz': {
          const dialog = new BeatmapImportDialog(file);
          dialog.uploadFinished.addListener(mapset => this.uploadFinished.emit(mapset));

          this.dependencies.resolve(DialogContainer).showDialog(dialog);
          break;
        }
        default:
          this.notifications.add(new Notification(
            'Cannot import file',
            undefined,
            0xFFFFFF,
          ));
      }
    }

    this.#overlay.hide();

    return true;
  }
}

class DropzoneOverlay extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      padding: 10,
      alpha: 0,
    });
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @resolved(EditorMixer)
  mixer!: EditorMixer;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      this.#outline = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        cornerRadius: 6,
        fillAlpha: 0,
        scale: 1.1,
        outlines: [{
          width: 3,
          color: this.colors.primary,
          alpha: 1,
        }],
      }),
      this.#text = new OsucadSpriteText({
        anchor: Anchor.Center,
        origin: Anchor.Center,
        fontSize: 32,
        color: this.colors.primary,
        text: 'Drop .osz file here',
      }),
    );

    this.mixer.music.addFilter(this.#filter);
  }

  #text!: OsucadSpriteText;

  @resolved(UISamples)
  samples!: UISamples;

  show() {
    this.#outline.scaleTo({ scale: 1, duration: 600, easing: 'expo.out' });
    this.fadeIn({ duration: 400 });

    this.#text.y = 50;
    this.#text.moveTo({ y: 0, duration: 600, easing: 'expo.out' });

    gsap.to(this.#filter.frequency, {
      value: 500,
      duration: 0.2,
    });

    this.samples.whoosh.play();
  }

  hide() {
    this.#outline.scaleTo({ scale: 1.1, duration: 600, easing: 'expo.out' });
    this.fadeOut({ duration: 250 });

    this.#text.moveTo({ y: 50, duration: 400 });

    gsap.to(this.#filter.frequency, {
      value: 22000,
      duration: 0.2,
    });
  }

  #outline!: RoundedBox;

  #filter = new LowpassFilter({
    frequency: 22000,
  });

  dispose(): boolean {
    this.mixer.music.removeFilter(this.#filter);

    return super.dispose();
  }
}
