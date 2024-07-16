import { io } from 'socket.io-client';
import { WebGameHost } from 'osucad-framework';
import { OsucadGame } from './OsucadGame';

import type { EditorContext } from './editor/context/EditorContext';
import './style.css';

async function main() {
  const host = new WebGameHost('osucad', {
    friendlyGameName: 'osucad',
  });

  const pathRegex = /\/edit\/(.*)/;

  let context: EditorContext;

  const match = pathRegex.exec(window.location.pathname);

  if (match) {
    const { OnlineEditorContext } = await import(
      './editor/context/OnlineEditorContext'
    );

    const joinKey = match[1];

    const host = window.origin.replace(/^https/, 'wss');

    const socket = io(`${host}/editor`, {
      withCredentials: true,
      query: { id: joinKey },
      transports: ['websocket'],
      autoConnect: false,
    });

    context = new OnlineEditorContext(socket);
  }
  else {
    const { DummyEditorContext } = await import(
      './editor/context/DummyEditorContext'
    );
    context = new DummyEditorContext();
  }

  host.run(new OsucadGame(context));
}

main();
