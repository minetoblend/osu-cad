import { OsucadButton, OsucadSpriteText } from '@osucad/core';
import { Anchor, Axes, CompositeDrawable, FillFlowContainer, resolved, Vec2 } from '@osucad/framework';
import { PlaceClient } from './PlaceClient';
import { UserAvatar } from './UserAvatar';

export class LoginButton extends CompositeDrawable {
  @resolved(PlaceClient)
  client!: PlaceClient;

  constructor() {
    super();

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    this.internalChildren = [
      this.#loginButton = new OsucadButton()
        .with({ anchor: Anchor.Center, origin: Anchor.Center })
        .withText('Login with osu!')
        .withAction(() => this.client.login()),
      this.#user = new FillFlowContainer({
        autoSizeAxes: Axes.Both,
        spacing: new Vec2(4),
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
          new OsucadSpriteText({
            text: 'Logged in as',
            fontSize: 14,
            anchor: Anchor.CenterLeft,
          }),
          this.#username = new OsucadSpriteText({
            text: 'username',
            fontSize: 14,
            anchor: Anchor.CenterLeft,
          }),
          this.#avatar = new UserAvatar().with({
            anchor: Anchor.CenterLeft,
          }),
        ],
      }),
    ];
  }

  #loginButton!: OsucadButton;
  #username!: OsucadSpriteText;
  #avatar!: UserAvatar;
  #user!: FillFlowContainer;

  protected loadComplete() {
    super.loadComplete();

    this.client.user.bindValueChanged((user) => {
      if (user.value) {
        this.#loginButton.hide();
        this.#user.show();

        this.#username.text = user.value.username;
        this.#avatar.userId.value = user.value.id;
      }
      else {
        this.#loginButton.show();
        this.#user.hide();
      }
    }, true);
  }
}
