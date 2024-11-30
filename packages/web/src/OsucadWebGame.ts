import type { DependencyContainer } from 'osucad-framework';
import { OsucadGameBase } from '@osucad/editor';
import { MultiplayerClient } from '@osucad/multiplayer';
import { Axes, Box } from 'osucad-framework';
import { io } from 'socket.io-client';
import { EditorActionContainer } from '../../editor/src/editor/EditorActionContainer';
import { Fit, ScalingContainer } from '../../editor/src/editor/ScalingContainer';
import { FpsOverlay } from '../../editor/src/FpsOverlay';
import { NotificationOverlay } from '../../editor/src/notifications/NotificationOverlay';
import { OsucadScreenStack } from '../../editor/src/OsucadScreenStack';
import { MultiplayerEditorLoader } from './editor/MultiplayerEditorLoader';
import { OnlineEditorEnvironment } from './OnlineEditorEnvironment';

export class OsucadWebGame extends OsucadGameBase {
  constructor() {
    super(new OnlineEditorEnvironment());
  }

  async load(dependencies: DependencyContainer) {
    await super.load(dependencies);

    const screenStack = new OsucadScreenStack();

    this.add(new Box({
      relativeSizeAxes: Axes.Both,
      color: 0x000000,
    }));

    this.add(new ScalingContainer({
      desiredSize: {
        x: 960,
        y: 768,
      },
      fit: Fit.Fill,
      child: new EditorActionContainer({
        child: new FpsOverlay({
          child: screenStack,
        }),
      }),
    }));

    const notificationOverlay = new NotificationOverlay();
    this.add(notificationOverlay);
    dependencies.provide(NotificationOverlay, notificationOverlay);

    screenStack.push(
      new MultiplayerEditorLoader(async () => {
        const client = new MultiplayerClient(
          () => io('http://localhost:3000', {
            transports: ['websocket'],
          }),
        );

        await client.load();

        return client.beatmap;
      }),
    );
  }
}
