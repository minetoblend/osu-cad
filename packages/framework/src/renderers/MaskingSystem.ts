import type {
  Container,
  Instruction,
  Renderable,
  Renderer,
  System,
} from 'pixi.js';
import type { MaskingEffect } from './MaskingEffect';
import type { MaskingAction } from './MaskingPipe';
import type { OsucadUniformSystem } from './OsucadUniformSystem';
import { clamp } from '@osucad/framework';

import { Color, ExtensionType, Rectangle } from 'pixi.js';
import { MatrixUtils } from '../utils/MatrixUtils';

export interface MaskingInstruction extends Instruction {
  renderPipeId: 'masking';
  action: MaskingAction;
  container?: Container;
  renderables?: Renderable[];
  maskingEffect: MaskingEffect;
}

let multiplier = 1;

addEventListener('wheel', (evt) => {
  multiplier = clamp(multiplier + Math.sign(evt.deltaY) * 0.1);
});

export class MaskingSystem implements System {
  public static extension = {
    type: [
      ExtensionType.WebGLSystem,
      ExtensionType.WebGPUSystem,
    ],
    name: 'masking',
  } as const;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
  }

  readonly renderer: Renderer;

  public destroy?: () => void;

  push(instruction: MaskingInstruction) {
    const renderer = this.renderer;

    const maskingInfo = instruction.maskingEffect;

    const uniformSystem = renderer.globalUniforms as unknown as OsucadUniformSystem;

    const maskingRect = maskingInfo.drawable.drawSize;

    const matrix = maskingInfo.matrix.copyFrom(instruction.container!.relativeGroupTransform).invert();

    const color
      = maskingInfo.borderColor
        ? Color.shared.setValue(maskingInfo.borderColor).setAlpha(maskingInfo.borderColor.alpha * instruction.container!.groupAlpha)
        : Color.shared.setValue('transparent');

    const bgr = color.toBgrNumber();

    const scale = MatrixUtils.extractScale(maskingInfo.drawable.drawNode.groupTransform);

    const maskingSmoothness = 1; // TODO

    const maskingBlendRange = maskingSmoothness * (1 / scale.x + 1 / scale.y) / 2;

    uniformSystem.push({
      isMasking: true,
      cornerRadius: maskingInfo.cornerRadius * multiplier,
      toMaskingSpace: matrix,
      maskingRect: new Rectangle(0, 0, maskingRect.x, maskingRect.y),
      borderThickness: maskingInfo.borderThickness / maskingBlendRange,
      borderColor: bgr + (((color.alpha * 255) | 0) << 24),
      maskingBlendRange,
    });
  }

  pop() {
    const renderer = this.renderer;

    renderer.globalUniforms.pop();
  }
}
