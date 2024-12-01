import type { ClientInfo } from '@osucad/multiplayer';
import { FastRoundedBox } from '@osucad/editor/drawables/FastRoundedBox';
import { UserAvatarCache } from '@osucad/editor/UserAvatarCache';
import { ConnectedUsers } from '@osucad/multiplayer';
import {
  Anchor,
  Axes,
  CompositeDrawable,
  Container,
  dependencyLoader,
  EasingFunction,
  FillFlowContainer,
  FillMode,
  resolved,
  RoundedBox,
  Vec2,
} from 'osucad-framework';

export class ConnectedUsersList extends CompositeDrawable {
  @resolved(ConnectedUsers)
  protected connectedUsers!: ConnectedUsers;

  @dependencyLoader()
  load() {
    this.anchor = Anchor.TopRight;
    this.origin = Anchor.TopRight;
    this.autoSizeAxes = Axes.X;
    this.relativeSizeAxes = Axes.Y;

    this.addInternal(this.#usersFlow = new FillFlowContainer({
      autoSizeAxes: Axes.X,
      relativeSizeAxes: Axes.Y,
      spacing: new Vec2(4),
      padding: { right: 8 },
      children: this.connectedUsers.users.map(user =>
        new UserBadge(user),
      ),
    }));

    this.connectedUsers.userJoined.addListener(user => this.#usersFlow.add(new UserBadge(user)));
  }

  protected loadComplete() {
    super.loadComplete();

    this.finishTransforms(true);
  }

  #usersFlow!: FillFlowContainer;
}

class UserBadge extends Container {
  constructor(readonly client: ClientInfo) {
    super({
      anchor: Anchor.CenterRight,
      origin: Anchor.CenterRight,
      size: 24,
      fillMode: FillMode.Fit,
      child: new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 13,
        alpha: 0.1,
      }),
    });
  }

  @resolved(UserAvatarCache)
  private userAvatarCache!: UserAvatarCache;

  @resolved(ConnectedUsers)
  protected connectedUsers!: ConnectedUsers;

  @dependencyLoader()
  load() {
    this.scaleTo(0).scaleTo(1, 300, EasingFunction.OutExpo);

    this.connectedUsers.userLeft.addListener(this.#onUserLeft, this);

    this.userAvatarCache.getAvatar(this.client.userId)
      .then((texture) => {
        if (!texture)
          return;

        if (this.isDisposed) {
          texture.destroy();
          return;
        }

        this.onDispose(() => texture.destroy());

        this.add(new RoundedBox({
          relativeSizeAxes: Axes.Both,
          texture,
          cornerRadius: 100,
        }));
      });
  }

  #onUserLeft(client: ClientInfo) {
    if (client.clientId === this.client.clientId) {
      this.scaleTo(0, 300, EasingFunction.OutExpo).expire();
    }
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.connectedUsers.userLeft.removeListener(this.#onUserLeft, this);
  }
}
