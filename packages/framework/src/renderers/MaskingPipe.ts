import type { Container, Effect, InstructionPipe, InstructionSet, Renderer } from 'pixi.js';
import type { MaskingInstruction } from './MaskingSystem';
import { ExtensionType } from 'pixi.js';

export type MaskingAction = 'pushMask' | 'popMask';

export class MaskingPipe implements InstructionPipe<MaskingInstruction> {
  public static extension = {
    type: [
      ExtensionType.WebGLPipes,
      ExtensionType.WebGPUPipes,
      ExtensionType.CanvasPipes,
    ],
    name: 'masking',
  } as const;

  constructor(renderer: Renderer) {
    this._renderer = renderer;
  }

  _renderer: Renderer;

  public push(maskingEffect: Effect, container: Container, instructionSet: InstructionSet): void {
    const renderPipes = this._renderer.renderPipes;

    renderPipes.batch.break(instructionSet);

    instructionSet.add({
      renderPipeId: 'masking',
      canBundle: false,
      action: 'pushMask',
      container,
      maskingEffect,
    } as MaskingInstruction);
  }

  public pop(filterEffect: Effect, container: Container, instructionSet: InstructionSet): void {
    this._renderer.renderPipes.batch.break(instructionSet);

    instructionSet.add({
      renderPipeId: 'masking',
      action: 'popMask',
      canBundle: false,
    });
  }

  public execute(instruction: MaskingInstruction) {
    if (instruction.action === 'pushMask') {
      this._renderer.masking.push(instruction);
    }
    else if (instruction.action === 'popMask') {
      this._renderer.masking.pop();
    }
  }

  public destroy() {
    this._renderer = null!;
  }
}
