import { ClientMessages, ServerMessages } from '@osucad/common';
import { Socket } from 'socket.io-client';

export type EditorSocket = Socket<ServerMessages, ClientMessages>;
