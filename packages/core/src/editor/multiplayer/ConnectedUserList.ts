import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { ConnectedUser } from './ConnectedUsers';
import { Axes, CompositeDrawable, FillDirection, FillFlowContainer, resolved } from '@osucad/framework';
import { OsucadMultiplayerClient } from './OsucadMultiplayerClient';

export class ConnectedUserList extends FillFlowContainer {
  constructor() {
    super();

    this.direction = FillDirection.Vertical;
    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(OsucadMultiplayerClient)
  client!: OsucadMultiplayerClient;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    for (const user of this.client.users.users)
      this.addUser(user);
  }

  readonly #users = new Map<ConnectedUser, UserAvatar>();

  addUser(user: ConnectedUser) {
    const drawable = new UserAvatar(user);
    this.#users.set(user, drawable);
    this.add(drawable);
  }
}

class UserAvatar extends CompositeDrawable {
  constructor(readonly user: ConnectedUser) {
    super();
  }
}
