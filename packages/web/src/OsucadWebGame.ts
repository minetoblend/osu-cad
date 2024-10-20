import type { IResourcesProvider } from '@osucad/editor';
import type { DependencyContainer } from 'osucad-framework';
import { Axes, Box, OsucadGameBase } from '@osucad/editor';
import { EditorActionContainer } from '../../editor/src/editor/EditorActionContainer';
import { EditorLoader } from '../../editor/src/editor/EditorLoader';
import { Fit, ScalingContainer } from '../../editor/src/editor/ScalingContainer';
import { FpsOverlay } from '../../editor/src/FpsOverlay';
import { NotificationOverlay } from '../../editor/src/notifications/NotificationOverlay';
import { OsucadScreenStack } from '../../editor/src/OsucadScreenStack';
import { ISkinSource } from '../../editor/src/skinning/ISkinSource';
import { SkinManager } from '../../editor/src/skinning/SkinManager';
import { OnlineBeatmapInfo } from './OnlineBeatmapInfo';
import { OnlineEditorEnvironment } from './OnlineEditorEnvironment';

export class OsucadWebGame extends OsucadGameBase implements IResourcesProvider {
  constructor() {
    super(new OnlineEditorEnvironment());
  }

  async load(dependencies: DependencyContainer) {
    await super.load(dependencies);

    this.add(new Box({
      relativeSizeAxes: Axes.Both,
    }));

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

    const skinManager = new SkinManager(this.environment.skins);
    this.dependencies.provide(ISkinSource, skinManager);
    this.dependencies.provide(SkinManager, skinManager);

    await this.loadComponentAsync(skinManager);

    screenStack.push(
      new EditorLoader(new OnlineBeatmapInfo()),
    );
  }
}
