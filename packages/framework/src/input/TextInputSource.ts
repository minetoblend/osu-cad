import { Action } from '../bindables/Action';

export class TextInputSource {
  constructor() {
    this.#inputElement.style.position = 'absolute';
    this.#inputElement.style.left = '-1000px';
    this.#inputElement.style.top = '-1000px';

    document.body.appendChild(this.#inputElement);

    this.#inputElement.addEventListener('blur', () => {
      if (this.isActive)
        this.#focusElement();
    });

    this.#inputElement.addEventListener('input', () => {
      this.onTextInput.emit(this.#inputElement.value);
      this.#inputElement.value = '';
    });
  }

  #focusElement() {
    this.#inputElement.focus({ preventScroll: true });

    if (document.activeElement !== this.#inputElement) {
      requestAnimationFrame(() => {
        if (this.isActive)
          this.#focusElement();
      });
    }
  }

  #isActive = false;

  get isActive() {
    return this.#isActive;
  }

  #inputElement = document.createElement('input');

  activate() {
    if (this.isActive)
      return;

    this.#isActive = true;

    this.#inputElement.value = '';

    this.#focusElement();
  }

  deactivate() {
    if (!this.isActive)
      return;

    this.#isActive = false;

    this.#inputElement.blur();
  }

  ensureActivated() {
    // TODO do this properly
    this.activate();
  }

  onTextInput = new Action<string>();
}
