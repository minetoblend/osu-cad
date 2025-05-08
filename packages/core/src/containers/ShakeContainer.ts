import type { ContainerOptions } from "@osucad/framework";
import { Container } from "@osucad/framework";

export interface ShakeContainerOptions extends ContainerOptions
{
  shakeDuration?: number
}

export class ShakeContainer extends Container
{
  constructor(options: ShakeContainerOptions = {})
  {
    const { shakeDuration, ...rest } = options;

    super(rest);

    this.shakeDuration = shakeDuration ?? 80;
  }

  public shakeDuration: number;

  override shake(maximumLength?: number)
  {
    super.shake(this.shakeDuration, undefined, maximumLength);
  }
}
