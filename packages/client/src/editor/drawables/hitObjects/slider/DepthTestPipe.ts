import {
  Effect,
  ExtensionType,
  GpuStencilModesToPixi,
  Instruction,
  InstructionPipe,
  Renderer,
  STENCIL_MODES,
  Container,
  InstructionSet,
} from "pixi.js";


export interface SliderInstruction extends Instruction {
  renderPipeId: 'depthTest',

}

export class DepthTestPipe implements InstructionPipe<SliderInstruction> {
  public static extension = {
    type: [
      ExtensionType.WebGPUPipes,
    ],
    name: 'depthTest',
  } as const;

  private readonly _renderer: Renderer;

  constructor(renderer: Renderer) {
    this._renderer = renderer;
  }

  push(effect: Effect, targetContainer: Container, instructionSet: InstructionSet) {
    const renderer = this._renderer;
    renderer.renderPipes.batch.break(instructionSet);

    instructionSet.add({
      renderPipeId: 'depthTest',
      action: 'pushDepthTest',
      canBundle: false,
    } as SliderInstruction);
  }

  pop(effect: Effect, targetContainer: Container, instructionSet: InstructionSet) {
    const renderer = this._renderer;
    renderer.renderPipes.batch.break(instructionSet);

    instructionSet.add({
      renderPipeId: 'depthTest',
      action: 'popDepthTest',
      canBundle: false,
    } as SliderInstruction);
  }

  execute(instruction: SliderInstruction) {
    const renderer = this._renderer;


    if (instruction.action === 'pushDepthTest') {
      renderer.stencil.setStencilMode(STENCIL_MODE_DEPTH_TEST, 0);
    } else if (instruction.action === 'popDepthTest') {
      renderer.stencil.setStencilMode(STENCIL_MODES.DISABLED, 0);
    }
  }
}

const STENCIL_MODE_DEPTH_TEST = 9999 as STENCIL_MODES;

GpuStencilModesToPixi[STENCIL_MODE_DEPTH_TEST] = {
  format: 'depth24plus-stencil8',
  depthCompare: 'always',
  depthWriteEnabled: true,
  stencilWriteMask: 0,
  stencilReadMask: 0,
}