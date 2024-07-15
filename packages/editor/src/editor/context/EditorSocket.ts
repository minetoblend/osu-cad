import type { ClientMessages, ServerMessages } from '@osucad/common';
import type { Socket } from 'socket.io-client';

export type EditorSocket = Socket<ServerMessages, ClientMessages>;
