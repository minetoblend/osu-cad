import type { GameHost } from '../../platform/GameHost';
import type { IInput } from '../stateChanges/IInput';
import { Vec2 } from '../../math';
import { MouseButton } from '../state/MouseButton';
import { FileDropEnterInput } from '../stateChanges/FileDropEnterInput';
import { FileDropInput } from '../stateChanges/FileDropInput';
import { MouseButtonInput } from '../stateChanges/MouseButtonInput';
import { MousePositionAbsoluteInput } from '../stateChanges/MousePositionAbsoluteInput';
import { MouseScrollRelativeInput } from '../stateChanges/MouseScrollRelativeInput';
import { PressureInput } from '../stateChanges/PressureInput';
import { InputHandler } from './InputHandler';

export class MouseHandler extends InputHandler {
  override initialize(host: GameHost): boolean {
    if (!super.initialize(host)) {
      return false;
    }

    this.enabled.addOnChangeListener(
      (enabled) => {
        if (enabled) {
          host.renderer.canvas.addEventListener('pointerdown', this.#handleMouseDown);
          host.renderer.canvas.addEventListener('pointerup', this.#handleMouseUp);
          host.renderer.canvas.addEventListener('pointermove', this.#handleMouseMove);
          host.renderer.canvas.addEventListener('mouseleave', this.#handleMouseLeave);
          host.renderer.canvas.addEventListener('wheel', this.#handleWheel);
          host.renderer.canvas.addEventListener('contextmenu', this.#preventDefault);
          host.renderer.canvas.addEventListener('dragover', this.#handleDragOver);
          host.renderer.canvas.addEventListener('dragleave', this.#handleDragLeave);
          host.renderer.canvas.addEventListener('drop', this.#handleDrop);
        }
        else {
          host.renderer.canvas.removeEventListener('pointerdown', this.#handleMouseDown);
          host.renderer.canvas.removeEventListener('pointerup', this.#handleMouseUp);
          host.renderer.canvas.removeEventListener('pointermove', this.#handleMouseMove);
          host.renderer.canvas.removeEventListener('mouseleave', this.#handleMouseLeave);
          host.renderer.canvas.removeEventListener('wheel', this.#handleWheel);
          host.renderer.canvas.removeEventListener('contextmenu', this.#preventDefault);
          host.renderer.canvas.removeEventListener('dragover', this.#handleDragOver);
          host.renderer.canvas.removeEventListener('drop', this.#handleDrop);
        }
      },
      { immediate: true },
    );

    this.#host = host;

    return true;
  }

  #host!: GameHost;

  #getMouseButton(event: MouseEvent): MouseButton | null {
    switch (event.button) {
      case 0:
        return MouseButton.Left;
      case 1:
        return MouseButton.Middle;
      case 2:
        return MouseButton.Right;
      default:
        return null;
    }
  }

  #handleMouseDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse')
      return;

    event.preventDefault();

    this.#host.renderer.canvas.setPointerCapture(event.pointerId);

    const button = this.#getMouseButton(event);

    if (button === null)
      return;

    this.#enqueueInput(new PressureInput(event.pressure));
    this.#enqueueInput(MouseButtonInput.create(button, true));
    this.flush.emit();
  };

  #handleMouseUp = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse')
      return;

    event.preventDefault();

    this.#host.renderer.canvas.releasePointerCapture(event.pointerId);

    const button = this.#getMouseButton(event);

    if (button === null)
      return;

    this.#enqueueInput(new PressureInput(event.pressure));
    this.#enqueueInput(MouseButtonInput.create(button, false));
    this.flush.emit();
  };

  #handleMouseLeave = (event: MouseEvent) => {};

  #handleMouseMove = (event: PointerEvent) => {
    event.preventDefault();

    if (event.pointerType === 'touch')
      return;

    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // x /= devicePixelRatio;
    // y /= devicePixelRatio;

    const index = this.pendingInputs.findIndex(it => it instanceof MousePositionAbsoluteInput);
    if (index !== -1) {
      // We only want to keep the most recent mouse position
      this.pendingInputs.splice(index, 1);
    }

    this.#enqueueInput(new PressureInput(event.pressure));
    this.#enqueueInput(new MousePositionAbsoluteInput(new Vec2(x, y)));
  };

  #enqueueInput(input: IInput) {
    this.pendingInputs.push(input);
  }

  override dispose(isDisposing: boolean = true): void {
    super.dispose(isDisposing);
    this.enabled.value = false;
  }

  #handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    this.#enqueueInput(new MouseScrollRelativeInput(new Vec2(event.deltaX / 100, -event.deltaY / 100), false));
  };

  #preventDefault = (event: MouseEvent) => {
    event.preventDefault();
  };

  #handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      if (event.dataTransfer.files) {
        this.#enqueueInput(new FileDropEnterInput(event.dataTransfer.files));
      }
    }

    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.#enqueueInput(new MousePositionAbsoluteInput(new Vec2(x, y)));
  };

  #handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    this.#enqueueInput(new FileDropEnterInput(null));
  };

  #handleDrop = (event: DragEvent) => {
    event.preventDefault();

    if (event.dataTransfer) {
      if (event.dataTransfer.files) {
        this.#enqueueInput(new FileDropInput(event.dataTransfer.files));
      }
    }
  };
}
