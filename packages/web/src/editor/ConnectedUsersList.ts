import type { ClientInfo } from '@osucad/multiplayer';
import { FastRoundedBox } from '@osucad/editor/drawables/FastRoundedBox';
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

    console.log(this.connectedUsers.users);

    this.addInternal(this.#usersFlow = new FillFlowContainer({
      autoSizeAxes: Axes.X,
      relativeSizeAxes: Axes.Y,
      spacing: new Vec2(4),
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
      size: 20,
      fillMode: FillMode.Fit,
      child: new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 10,
      }),
    });
  }

  @resolved(ConnectedUsers)
  protected connectedUsers!: ConnectedUsers;

  @dependencyLoader()
  load() {
    this.scaleTo(0).scaleTo(1, 300, EasingFunction.OutExpo);

    this.connectedUsers.userLeft.addListener(this.#onUserLeft, this);
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
