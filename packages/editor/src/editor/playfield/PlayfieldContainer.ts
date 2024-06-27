import { Axes, Container } from "osucad-framework";

export class PlayfieldContainer extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }
}