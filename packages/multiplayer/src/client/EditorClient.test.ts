import type { InitialStateServerMessage } from '../protocol/ServerMessage';
import type { ClientSocket } from './ClientSocket';
import { Beatmap, BeatmapSerializer } from '@osucad/common';
import { Json } from '@osucad/serialization';
// @ts-expect-error there's no types for this module
import MockedSocket from 'socket.io-mock';
import { expect } from 'vitest';
import { MultiplayerClient } from './MultiplayerClient';
import { MultiplayerEditorBeatmap } from './MultiplayerEditorBeatmap';

describe('editorClient', () => {
  it('correctly initializes', async () => {
    const socket = new MockedSocket() as ClientSocket;

    socket.on('initialData', console.log);

    const client = new MultiplayerClient(() => socket);

    const loadP = client.load();

    ;(socket as any).socketClient.emit('initialData', {
      clientId: 1,
      assets: [],
      beatmapData: new Json().encode(new BeatmapSerializer(), new Beatmap()),
    } as InitialStateServerMessage);

    await loadP;

    expect(client.clientId).toBe(1);
    expect(client.beatmap).toBeInstanceOf(MultiplayerEditorBeatmap);
    expect(client.beatmap.beatmap).toBeInstanceOf(Beatmap);
  });
});
