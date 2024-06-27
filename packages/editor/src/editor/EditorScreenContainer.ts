import { Axes, Container } from "osucad-framework";
import { PlayfieldContainer } from "./playfield/PlayfieldContainer";

export class EditorScreenContainer extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.add(new PlayfieldContainer());
  }
}
