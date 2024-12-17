import type { DependencyContainer } from 'osucad-framework';
import { DummyEditorBeatmap, Editor } from '@osucad/common';
import { OsucadGameBase } from '@osucad/editor';
import { UserAvatarCache } from '@osucad/editor/UserAvatarCache';
import { Axes, Box } from 'osucad-framework';
import { OsucadScreenStack } from '../../common/src/screens/OsucadScreenStack';
import { EditorActionContainer } from '../../editor/src/editor/EditorActionContainer';
import { Fit, ScalingContainer } from '../../editor/src/editor/ScalingContainer';
import { FpsOverlay } from '../../editor/src/FpsOverlay';
import { NotificationOverlay } from '../../editor/src/notifications/NotificationOverlay';
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

    const avatarCache = new UserAvatarCache();

    this.add(avatarCache);
    this.dependencies.provide(avatarCache);

    const notificationOverlay = new NotificationOverlay();
    this.add(notificationOverlay);
    dependencies.provide(NotificationOverlay, notificationOverlay);

    const beatmap = new DummyEditorBeatmap();

    const editor = new Editor(beatmap);

    screenStack.push(editor);
  }
}
