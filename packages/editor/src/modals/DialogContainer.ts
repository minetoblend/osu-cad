import type { ContainerOptions, KeyDownEvent, MouseDownEvent, UIEvent } from 'osucad-framework';
import { Axes, Box, Container, ScreenStack, dependencyLoader } from 'osucad-framework';
import type { Dialog } from './Dialog';

export class DialogContainer extends Container {
  constructor(options: ContainerOptions = {}) {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      this.#content = new Container({
        relativeSizeAxes: Axes.Both,
      }),
      this.#overlay = new DialogOverlay(() => this.closeDialog()),
      this.#screenStack = new ScreenStack(),
    );

    this.with(options);
  }

  @dependencyLoader()
  load() {
    this.dependencies.provide(DialogContainer, this);

    this.#screenStack.screenExited.addListener(() => this.onDialogExited());
  }

  get content() {
    return this.#content;
  }

  readonly #content: Container;

  readonly #overlay: DialogOverlay;

  readonly #screenStack;

  get currentDialog(): Dialog | null {
    return this.#screenStack.currentScreen as Dialog | null;
  }

  showDialog(dialog: Dialog) {
    if (!this.currentDialog) {
      this.#overlay.show();
    }

    this.#screenStack.push(dialog);
  }

  closeDialog() {
    if (this.currentDialog) {
      this.#screenStack.exit(this.currentDialog);
    }
  }

  onDialogExited() {
    console.log('onDialogExited', this.currentDialog);
    if (!this.currentDialog) {
      this.#overlay.hide();
    }
  }
}

class DialogOverlay extends Box {
  constructor(
    readonly mousedown: () => void,
  ) {
    super({
      relativeSizeAxes: Axes.Both,
      color: 0x000000,
      alpha: 0,
    });
  }

  isVisible = false;

  show() {
    this.fadeTo(0.5, 200);

    this.isVisible = true;
  }

  hide() {
    this.fadeOut(200);

    this.isVisible = false;
  }

  handle(e: UIEvent): boolean {
    if (this.isVisible) {
      super.handle(e);

      return true;
    }

    return false;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    return false;
  }

  onKeyDown(e: KeyDownEvent): boolean {
    return false;
  }
}
