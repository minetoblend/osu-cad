import { Axes, Box, Container, dependencyLoader, resolved } from "osucad-framework";
import { ThemeColors } from "../ThemeColors";

export class OverviewTimeline extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
    
  }

  @resolved(ThemeColors)
  theme!: ThemeColors;

  @dependencyLoader()
  init() {
    this.addInternal(new Box({
      relativeSizeAxes: Axes.Both,
      color: this.theme.translucent,
      alpha: 0.5,
    }))
  }
}