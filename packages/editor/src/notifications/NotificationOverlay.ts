import type { Drawable } from 'osucad-framework';
import type { Notification } from './Notification';
import { Anchor, Axes, Container, EasingFunction, FillDirection, FillFlowContainer } from 'osucad-framework';

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
    layoutEasing: EasingFunction.OutExpo,
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
    notification.fadeIn(200);

    this.#content.insert(-(this.#notificationCount++), notification);

    return notification;
  }

  dismiss(notification: Notification) {
    notification.fadeOut(200);
    notification.movementContainer.moveToX(200, 200);
    notification.expire();
  }
}
