import type { GameHost } from '../../platform/GameHost';
import type { IInput } from '../stateChanges/IInput';
import { Action } from '../../bindables';
import { Key } from '../state/Key';
import { ButtonInputEntry } from '../stateChanges/ButtonInput';
import { KeyboardKeyInput } from '../stateChanges/KeyboardKeyInput';
import { InputHandler } from './InputHandler';

export class KeyboardHandler extends InputHandler {
  override initialize(host: GameHost): boolean {
    if (!super.initialize(host)) {
      return false;
    }

    this.enabled.addOnChangeListener(
      (enabled) => {
        if (enabled) {
          window.addEventListener('keydown', this.#handleKeyDown);
          window.addEventListener('keyup', this.#handleKeyUp);
          window.addEventListener('blur', this.#handleBlur);
        }
        else {
          window.removeEventListener('keydown', this.#handleKeyDown);
          window.removeEventListener('keyup', this.#handleKeyUp);
          window.removeEventListener('blur', this.#handleBlur);
        }
      },
      { immediate: true },
    );

    return true;
  }

  #getKey(event: KeyboardEvent): Key | null {
    const key = Key[event.code as keyof typeof Key];

    if (key === undefined) {
      return null;
    }

    return key;
  }

  #pressedKeys = new Set<Key>();

  #superPressed = false;

  #isMac = navigator.userAgent.includes('Mac');

  #handleKeyDown = (event: KeyboardEvent) => {
    if (this.#shouldPreventDefault(event))
      event.preventDefault();

    if (event.repeat)
      return;

    const key = this.#getKey(event);

    if (key === Key.MetaLeft) {
      this.#superPressed = true;
    }

    if (key !== null) {
      this.#pressedKeys.add(key);
      this.#enqueueInput(KeyboardKeyInput.create(key, true));

      // On Mac OS we don't receive key up events while super key is pressed, so we need to simulate them
      if (this.#isMac && this.#superPressed && key !== Key.MetaLeft) {
        if (
          key === Key.ShiftLeft
          || key === Key.ShiftRight
          || key === Key.ControlLeft
          || key === Key.ControlRight
          || key === Key.AltLeft
          || key === Key.AltRight
        ) {
          return;
        }

        this.#enqueueInput(KeyboardKeyInput.create(key, false));
      }
    }
  };

  #shouldPreventDefault(event: KeyboardEvent): boolean {
    if (/^\d$/.test(event.key) && event.ctrlKey)
      return true;

    switch (event.key) {
      case 'R':
      case 'r':
      case 'w':
      case 'W':
      case 'z':
      case 'o':
        return event.ctrlKey || event.metaKey;
      case 'Tab':
        return true;
    }

    return false;
  }

  #handleKeyUp = (event: KeyboardEvent) => {
    event.preventDefault();

    const key = this.#getKey(event);

    if (key === Key.MetaLeft) {
      this.#superPressed = false;
    }

    if (key !== null) {
      this.#pressedKeys.delete(key);
      this.#enqueueInput(KeyboardKeyInput.create(key, false));
    }
  };

  onInput = new Action();

  #enqueueInput(input: IInput) {
    this.pendingInputs.push(input);
  }

  #handleBlur = () => {
    const pressedKeys = [...this.#pressedKeys];
    this.#enqueueInput(new KeyboardKeyInput(pressedKeys.map(key => new ButtonInputEntry(key, false))));
  };
}
