import type { Box, ClickEvent, HoverEvent, HoverLostEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import { APIProvider, OsucadColors, OsucadSpriteText } from '@osucad/core';
import { Anchor, Axes, CompositeDrawable, Container, FastRoundedBox, resolved } from '@osucad/framework';

export class LoginButton extends CompositeDrawable {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.autoSizeAxes = Axes.X;
    this.relativeSizeAxes = Axes.Y;
    this.padding = { vertical: 2 };

    this.internalChildren = [
      this.#background = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0x343440,
        cornerRadius: 4,
      }),
      new Container({
        autoSizeAxes: Axes.X,
        relativeSizeAxes: Axes.Y,
        padding: { horizontal: 10 },
        child: new OsucadSpriteText({
          text: 'Login with osu!',
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
          color: OsucadColors.primary,
          fontSize: 12,
        }),
      }),
    ];
  }

  #flash!: Box;

  @resolved(APIProvider)
  api!: APIProvider;

  override onClick(e: ClickEvent): boolean {
    this.api.login();

    return true;
  }

  #background!: FastRoundedBox;

  override onHover(e: HoverEvent): boolean {
    this.#background.fadeColor(0x434352, 100);

    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#background.fadeColor(0x343440, 100);
  }
}
