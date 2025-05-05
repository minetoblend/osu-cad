import type { ContainerOptions } from "./Container";
import { Container } from "./Container";

export interface MaskingContainerOptions extends ContainerOptions 
{
  cornerRadius?: number;
}

export class MaskingContainer extends Container 
{
  constructor(options: MaskingContainerOptions = {}) 
  {
    super();

    this.masking = true;

    this.with(options);
  }
}
