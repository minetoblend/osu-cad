import { Axes, Container, Invalidation, LayoutMember } from "osucad-framework";
import { PlayfieldContainer } from "./playfield/PlayfieldContainer";

export class EditorScreenContainer extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
      padding: { vertical: 10 },
    });
    this.addLayout(this.#paddingBacking);

    this.add(new PlayfieldContainer());
  }

  #paddingBacking = new LayoutMember(Invalidation.DrawSize);

  update(): void {
    super.update();

    if (!this.#paddingBacking.isValid) {
      this.padding = {
        top: this.drawSize.x < 1250 ? 10 : 0,
        bottom: this.drawSize.x < 1120 ? 10 : 0,
      }
      this.#paddingBacking.validate();
    }
  }
}
