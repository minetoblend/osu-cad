import { Axes, CompositeDrawable, Container, RoundedBox } from 'osucad-framework';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { NotificationOverlay } from './NotificationOverlay';

export class Notification extends CompositeDrawable {
  constructor(
    readonly title: string,
    description?: string,
    color: number = 0xB6B6C3,
  ) {
    super();

    this.autoSizeAxes = Axes.Y;
    this.relativeSizeAxes = Axes.X;
    this.alpha = 0.9;

    const descriptionDrawable = new OsucadSpriteText({
      text: description ?? '',
      y: 22,
      alpha: 0.85,
      fontSize: 16,
    });

    descriptionDrawable.style.wordWrap = true;
    descriptionDrawable.style.wordWrapWidth = 340;

    this.addAllInternal(
      this.movementContainer = new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        children: [
          new RoundedBox({
            relativeSizeAxes: Axes.Both,
            fillColor: 0x222228,
            alpha: 0.8,
            cornerRadius: 8,
            outlines: [
              {
                width: 1.5,
                color,
                alpha: 1,
              },
            ],
          }),
          new Container({
            autoSizeAxes: Axes.Both,
            padding: 12,
            children: [
              new OsucadSpriteText({
                text: title,
                color: 0xB6B6C3,
                fontSize: 18,
              }),
              descriptionDrawable,
            ],
          }),
        ],
      }),
    );
  }

  movementContainer!: Container;

  dismiss() {
    this.findClosestParentOfType(NotificationOverlay)?.dismiss(this);
  }

  onHover(): boolean {
    this.alpha = 1;
    return true;
  }

  onHoverLost(): boolean {
    this.alpha = 0.9;
    return true;
  }

  onMouseDown(): boolean {
    return true;
  }

  onClick(): boolean {
    this.dismiss();

    return true;
  }
}
