import { Socket } from 'socket.io-client';
import { ClientMessages, ServerMessages } from '@osucad/common';

export type EditorSocket = Socket<ServerMessages, ClientMessages>;
