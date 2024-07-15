import { Action, Bindable } from 'osucad-framework';
import type { UserActivity, UserSessionInfo } from '@osucad/common';
import type { EditorSocket } from './EditorSocket';

export class ConnectedUsersManager {
  readonly userJoined = new Action<UserSessionInfo>();

  readonly userLeft = new Action<UserSessionInfo>();

  readonly userActivityUpdated = new Action<UserSessionInfo>();

  ownUser!: UserSessionInfo;

  usersBindable = new Bindable<UserSessionInfo[]>([]);

  get users() {
    return this.usersBindable.value;
  }

  socket!: EditorSocket;

  async init(socket: EditorSocket) {
    this.socket = socket;

    socket.once('identity', user => (this.ownUser = user));

    socket.on('connectedUsers', users => (this.usersBindable.value = users));
    socket.on('userJoined', user => this.#onUserJoined(user));
    socket.on('userLeft', user => this.#onUserLeft(user));
    socket.on('userActivity', (sessionId, activity) =>
      this.#updateUserActivity(sessionId, activity));
  }

  #onUserJoined(user: UserSessionInfo) {
    this.usersBindable.value = [...this.usersBindable.value, user];
    this.userJoined.emit(user);
  }

  #onUserLeft(user: UserSessionInfo) {
    this.usersBindable.value = this.usersBindable.value.filter(
      u => u.sessionId !== user.sessionId,
    );
    this.userLeft.emit(user);
  }

  #updateUserActivity(sessionId: number, activity: UserActivity) {
    const user = this.usersBindable.value.find(
      u => u.sessionId === sessionId,
    );
    if (user) {
      user.presence.activity = activity;
      this.userActivityUpdated.emit(user);
    }
  }

  updateActivity(activity: UserActivity | null) {
    this.socket.emit('setPresence', {
      activity,
      activeBeatmap: null,
    });
  }
}
