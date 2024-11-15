import { Axes, EasingFunction, WebGameHost } from 'osucad-framework';
import { OsucadGame } from '@osucad/editor';
import '../assets/main.css';
import { ElectronEnvironment } from './ElectronEnvironment';
import { NotificationOverlay } from '@osucad/editor/notifications/NotificationOverlay';
import { Notification } from '@osucad/editor/notifications/Notification';
import { FastRoundedBox } from '@osucad/editor/drawables/FastRoundedBox';
import { Container } from 'osucad-framework';
import { OsucadButton } from '@osucad/editor/userInterface/OsucadButton.ts';

const environment = new ElectronEnvironment();

const game = new OsucadGame(environment);

const host = new WebGameHost('osucad', {
  friendlyGameName: 'osucad',
});

game.fullyLoaded.addListener(() =>
{

  window.api.onUpdateAvailable(() =>
  {
    console.log('update available');
    game.dependencies.resolve(NotificationOverlay).add(new UpdateAvailableNotification());
  });
  window.api.checkForUpdates();
});

host.run(game);

class UpdateAvailableNotification extends Notification
{
  constructor()
  {
    super('A new update is available');

    this.mainContent.add(new Container({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      padding: { vertical: 4 },
      children: [
        new FastRoundedBox({
          relativeSizeAxes: Axes.X,
          height: 4,
          color: 0x000000,
          alpha: 0.2,
        }),
        this.progressBar = new FastRoundedBox({
          relativeSizeAxes: Axes.X,
          height: 4,
          width: 0,
          color: 0x52CCA3,
        }),
      ],
    }));

    const stop = window.api.onUpdateDownloadProgress(progress =>
    {
      if (progress === 100)
        return;

      this.progressBar.resizeWidthTo(progress / 100, 300, EasingFunction.OutExpo);
    });
    this.onDispose(stop);

    window.api.onUpdateDownloadComplete(() =>
    {
      this.progressBar.resizeWidthTo(1, 300, EasingFunction.OutExpo);

      this.mainContent.add(new OsucadButton().withText('Update and restart!').withAction(() => window.api.installUpdate()));
    });
  }

  progressBar!: FastRoundedBox;

  override get dismissAutomatically()
  {
    return false;
  }
}
