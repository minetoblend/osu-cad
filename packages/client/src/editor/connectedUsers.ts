import { UserId, UserSessionInfo } from '@osucad/common';
import { EditorEventsList } from './events.ts';
import { Ref } from 'vue';
import { EditorSocket } from '@/editor/editorSocket.ts';
import { useEditor } from '@/editor/editorContext.ts';

export interface EditorUsersList {
  users: Ref<UserSessionInfo[]>;

  ownUser: Ref<UserSessionInfo | undefined>;

  kick(id: UserId): void;

  ban(id: UserId): void;
}

export function createConnectedUsers(
  socket: EditorSocket,
  events: EditorEventsList,
) {
  const users = ref<UserSessionInfo[]>([]);
  const ownUser = ref<UserSessionInfo>();

  socket.on('roomState', (payload) => {
    users.value = payload.users;
    ownUser.value = payload.ownUser;
  });

  socket.on('userJoined', (user) => {
    users.value.push(user);
    events.add({ message: `${user.username} joined` });
  });

  socket.on('userLeft', (user, reason) => {
    users.value = users.value.filter((u) => u.sessionId !== user.sessionId);
    switch (reason) {
      case 'kicked':
        events.add({ message: `${user.username} was kicked` });
        break;
      case 'banned':
        events.add({ message: `${user.username} was banned` });
        break;
      default:
        events.add({ message: `${user.username} left` });
    }
  });

  socket.on('userActivity', (sessionId, activity) => {
    const user = users.value.find((it) => it.sessionId === sessionId);
    if (user) {
      user.presence.activity = activity;
    }
  });

  function kick(id: UserId) {
    socket.emit('kickUser', id, '', false);
  }

  function ban(id: UserId) {
    socket.emit('kickUser', id, '', true);
  }

  socket.on('roll', (user) => {
    events.add({
      message: `${user.username} rolled 727`,
    });
  });

  socket.on('accessChanged', (access) => {
    if (ownUser.value) ownUser.value.access = access;
  });

  return { users, kick, ban, ownUser };
}

export function useConnectedUsers(): EditorUsersList {
  return useEditor().connectedUsers;
}
