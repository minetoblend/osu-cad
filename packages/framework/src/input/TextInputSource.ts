import { diffChars } from 'diff';
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

    let previousText = '';

    let previousSelection = {
      start: this.#inputElement.selectionStart,
      end: this.#inputElement.selectionEnd,
      direction: this.#inputElement.selectionDirection,
    };

    this.#inputElement.addEventListener('beforeinput', () => {
      previousText = this.#inputElement.value;

      previousSelection = {
        start: this.#inputElement.selectionStart,
        end: this.#inputElement.selectionEnd,
        direction: this.#inputElement.selectionDirection,
      };
    });

    this.#inputElement.addEventListener('input', (evt) => {
      const newText: string | null = (evt as any).data;

      const { start, end } = previousSelection;

      if (
        start !== null
        && end !== null
        && start !== end) {
        this.onTextRemoved.emit({ start, length: Math.abs(end - start) });

        if (newText === null)
          return;
      }

      if (newText !== null) {
        this.onTextInput.emit(newText);
      }
      else {
        const changes = diffChars(previousText, this.#inputElement.value);

        let index = 0;

        for (const change of changes) {
          if (change.removed) {
            this.onTextRemoved.emit({ start: index, length: change.count ?? 0 });
            return;
          }

          index += change.count ?? 0;
        }
      }
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

  onTextRemoved = new Action<TextRemovedEvent>();

  setTextAndSelection(
    text: string,
    selectionStart: number,
    selectionEnd: number,
  ) {
    this.#inputElement.value = text;

    this.#inputElement.setSelectionRange(selectionStart, selectionEnd);
  }
}

export interface TextRemovedEvent { start: number; length: number }
