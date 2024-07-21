import type { Drawable } from 'osucad-framework';
import { Anchor, Axes, Container, FillDirection, FillFlowContainer } from 'osucad-framework';
import type { Notification } from './Notification';

export class NotificationOverlay extends Container {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.addInternal(this.#content);
  }

  #content = new FillFlowContainer({
    direction: FillDirection.Vertical,
    autoSizeAxes: Axes.Y,
    width: 400,
    padding: 20,
    anchor: Anchor.TopRight,
    origin: Anchor.TopRight,
    layoutDuration: 300,
    layoutEasing: 'expo.out',
    spacing: { x: 0, y: 6 },
  });

  get content() {
    return this.#content;
  }

  #notificationCount = 0;

  add<T extends Drawable>(notification: T & Notification): T {
    this.scheduler.addDelayed(() => {
      this.dismiss(notification);
    }, 5000);

    notification.x = 200;
    notification.alpha = 0;
    notification.fadeIn({ duration: 200 });

    this.#content.insert(-(this.#notificationCount++), notification);

    return notification;
  }

  dismiss(notification: Notification) {
    notification.fadeOut({ duration: 200 });
    notification.movementContainer.moveTo({ x: 200, duration: 200 });
    notification.expire();
  }
}
