import type {
  ClickEvent,
  FocusEvent,
  FocusLostEvent,
  HoverEvent,
  HoverLostEvent,
  ReadonlyDependencyContainer,
  ValueChangedEvent,
} from '@osucad/framework';
import {
  APIProvider,
  APIState,
  LoadingSpinner,
  OsucadColors,
  OsucadSpriteText,
  ReverseFillFlowContainer,
} from '@osucad/core';
import {
  Anchor,
  Axes,
  CompositeDrawable,
  Container,
  EasingFunction,
  FastRoundedBox,
  resolved,
  Vec2,
} from '@osucad/framework';
import { LoginButton } from './LoginButton';
import { UserAvatar } from './UserAvatar';

export class UserInfoOverlay extends CompositeDrawable {
  @resolved(APIProvider)
  api!: APIProvider;

  #background!: FastRoundedBox;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Y;
    this.width = 140;

    this.internalChildren = [
      this.#background = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 4,
        alpha: 0,
      }),
      this.#mainContent = new ReverseFillFlowContainer({
        relativeSizeAxes: Axes.Both,
        padding: { horizontal: 4 },
        spacing: new Vec2(8),
        children: [
          this.#username = new OsucadSpriteText({
            text: 'Guest',
            color: OsucadColors.text,
            anchor: Anchor.CenterRight,
            origin: Anchor.CenterRight,
            fontSize: 14,
          }),
          new UserAvatar().with({
            width: 26,
            height: 26,
            anchor: Anchor.CenterRight,
            origin: Anchor.CenterRight,
          }),
        ],
      }),
      this.#loginButton = new LoginButton().with({
        anchor: Anchor.CenterRight,
        origin: Anchor.CenterRight,
      }),
      this.#spinner = new LoadingSpinner().with({
        size: 20,
        anchor: Anchor.CenterRight,
        origin: Anchor.Center,
        x: -26,
      }),
      this.#dropdown = new UserInfoDropdown(),
    ];

    this.api.localUser.bindValueChanged((user) => {
      this.#username.text = user.value.username;
    });

    this.api.state.bindValueChanged(this.#onStateChanged, this, true);
  }

  #loginButton!: LoginButton;

  #onStateChanged(state: ValueChangedEvent<APIState>) {
    switch (state.value) {
      case APIState.Connecting:
        this.#spinner
          .scaleTo(0.5)
          .scaleTo(1, 200, EasingFunction.Out)
          .fadeInFromZero(100);

        this.#mainContent.fadeOut(100);
        this.#loginButton.fadeOut(100);
        break;

      case APIState.LoggedIn:
        this.#spinner
          .fadeOut(100)
          .scaleTo(0.8, 100, EasingFunction.Out);

        this.#mainContent.fadeIn(100);
        this.#loginButton.fadeOut(100);
        break;

      case APIState.Offline:
        this.#spinner
          .fadeOut(100)
          .scaleTo(0.8, 100, EasingFunction.Out);

        this.#mainContent.fadeOut(100);
        this.#loginButton.fadeIn(100);
    }
  }

  #dropdown!: UserInfoDropdown;

  #username!: OsucadSpriteText;

  #mainContent!: Container;

  #spinner!: LoadingSpinner;

  override onHover(e: HoverEvent): boolean {
    if (this.api.state.value !== APIState.LoggedIn)
      return false;

    this.#background.fadeTo(0.1, 100);

    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#background.fadeOut(100);
  }

  override onClick(e: ClickEvent): boolean {
    this.schedule(() => this.getContainingFocusManager()?.changeFocus(this.#dropdown));
    return true;
  }
}

class UserInfoDropdown extends CompositeDrawable {
  constructor() {
    super();

    this.anchor = Anchor.BottomRight;
    this.origin = Anchor.TopRight;
    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;
    this.y = -20;
    this.alpha = 0;

    this.alwaysPresent = true;

    this.internalChildren = [
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 4,
        color: OsucadColors.translucent,
        alpha: 0.9,
      }),
      new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        padding: { horizontal: 12, vertical: 6 },
        child: new OsucadSpriteText({
          text: 'Logout',
          fontSize: 14,
          color: OsucadColors.text,
        }),
      }),
      this.#hoverHighlight = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 4,
        alpha: 0,
      }),
    ];
  }

  readonly #hoverHighlight: FastRoundedBox;

  override get handlePositionalInput(): boolean {
    return this.hasFocus;
  }

  override onHover(e: HoverEvent): boolean {
    this.#hoverHighlight.fadeTo(0.1, 100);
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#hoverHighlight.fadeTo(0, 100);
  }

  @resolved(APIProvider)
  api!: APIProvider;

  override onClick(e: ClickEvent): boolean {
    if (!this.hasFocus)
      return false;

    this.api.logout();
    this.schedule(() => this.getContainingFocusManager()?.changeFocus(null));
    return true;
  }

  override get acceptsFocus(): boolean {
    return true;
  }

  override onFocus(e: FocusEvent) {
    this.moveToY(0, 300, EasingFunction.OutExpo).fadeIn(200);
  }

  override onFocusLost(e: FocusLostEvent) {
    this.moveToY(-20, 300, EasingFunction.OutExpo).fadeOut(200);
  }
}
