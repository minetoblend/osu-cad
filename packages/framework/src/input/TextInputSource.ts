import { Action } from '../bindables/Action';

export class TextInputSource {
  constructor() {
    this.#inputElement.style.position = 'absolute';
    this.#inputElement.style.left = '-1000px';
    this.#inputElement.style.top = '-1000px';

    document.body.appendChild(this.#inputElement);

    this.#inputElement.onblur = () => {
      if (this.isActive)
        this.#inputElement.focus();
    };

    this.#inputElement.oninput = () => {
      this.onTextInput.emit(this.#inputElement.value);
      this.#inputElement.value = '';
    };
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

    this.#inputElement.focus({ preventScroll: true });
  }

  deactivate() {
    if (!this.isActive)
      return;

    this.#isActive = false;

    this.#inputElement.blur();
  }

  onTextInput = new Action<string>();
}
